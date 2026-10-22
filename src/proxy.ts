import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ✅ شغلك القديم
import { checkManualMaintenance } from '@/lib/manual-maintenance';
import { checkScheduledMaintenance } from '@/lib/scheduled-maintenance';

// ✅ الجديد بتاع Edge Config
import { isMaintenanceMode } from '@/lib/maintenance';

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 1. فحص الصيانة اليدوية (اللي إنت عملتها)
    const manualResponse = checkManualMaintenance(request);
    if (manualResponse) return manualResponse;

    // 2. فحص الصيانة المجدولة (اللي إنت عملتها)
    const scheduledResponse = checkScheduledMaintenance(request);
    if (scheduledResponse) return scheduledResponse;

    // 3. فحص الصيانة من Vercel Edge Config (اللي إحنا بنعمله دلوقتي)
    const edgeMaintenance = await isMaintenanceMode();

    // لو الصيانة شغالة من Vercel، اقفل الموقع ما عدا صفحات الأدمن واللوجين
    if (edgeMaintenance && !pathname.startsWith('/admin') && !pathname.startsWith('/login')) {
        return NextResponse.rewrite(new URL('/maintenance', request.url));
    }

    // --- باقي الكود بتاعك زي ما هو بالظبط ---
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

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

    const isUserProtected = pathname.startsWith('/account')
    const isAdminProtected = pathname.startsWith('/admin/dashboard')

    // حماية المستخدمين (لو مش مسجل يروح للوجين)
    if (!user && isUserProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // حماية الأدمن (لو مش مسجل يروح للوجين الأدمن)
    if (!user && isAdminProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }

    // منع الـ Open Redirect في اللوجين
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
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}