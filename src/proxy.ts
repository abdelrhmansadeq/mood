import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkManualMaintenance } from '@/lib/manual-maintenance';
import { checkScheduledMaintenance } from '@/lib/scheduled-maintenance';
import { isMaintenanceMode } from '@/lib/maintenance';

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 1. فحص الصيانة (اليدوية والمجدولة والـ Flags)
    const manualResponse = checkManualMaintenance(request);
    if (manualResponse) return manualResponse;

    const scheduledResponse = checkScheduledMaintenance(request);
    if (scheduledResponse) return scheduledResponse;

    try {
        const edgeMaintenance = await isMaintenanceMode();
        // لو الصيانة شغالة، ومش مسار أدمن أو لوجين، اعرض صفحة الصيانة
        if (edgeMaintenance && !pathname.startsWith('/admin') && !pathname.startsWith('/login')) {
            return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
    } catch (error) {
        console.error("Maintenance check failed:", error);
        // Fail-Open: لو الفحص فشل، الموقع يكمل عادي
    }

    // ✅ 2. تحسين الأداء: نفحص الـ Supabase Auth فقط للمسارات المحمية
    const isUserProtected = pathname.startsWith('/account')
    const isAdminProtected = pathname.startsWith('/admin/dashboard')
    const isAuthRoute = pathname === '/login' || pathname === '/signup'

    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    // لو المسار مش محتاج تسجيل دخول، نرجع الاستجابة فوراً بدون استهلاك موارد
    if (!isUserProtected && !isAdminProtected && !isAuthRoute) {
        return response;
    }

    // إنشاء اتصال Supabase فقط عند الحاجة
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 3. حماية المستخدمين
    if (!user && isUserProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // 4. حماية الأدمن
    if (!user && isAdminProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }

    // 5. لو مسجل دخول وبيحاول يفتح صفحة اللوجين
    if (user && pathname === '/login') {
        let next = request.nextUrl.searchParams.get('next') || '/account'
        if (!next.startsWith('/') || next.startsWith('//')) {
            next = '/account'
        }
        return NextResponse.redirect(new URL(next, request.url))
    }

    return response
}

export const config = {
    // ✅ استثنينا كل حاجة ملهاش لازمة تمر على الـ Proxy عشان نحسن الأداء
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - monitoring (Sentry)
         * - images and fonts
         */
        '/((?!api|_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)',
    ],
}