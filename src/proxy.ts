import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/////////maintenence
import { checkManualMaintenance } from '@/lib/manual-maintenance';
import { checkScheduledMaintenance } from '@/lib/scheduled-maintenance';

export async function proxy(request: NextRequest) {
    // ✅ فحص الصيانة اليدوية أولاً
    const manualResponse = checkManualMaintenance(request);
    if (manualResponse) return manualResponse;

    // ✅ فحص الصيانة المجدولة
    const scheduledResponse = checkScheduledMaintenance(request);
    if (scheduledResponse) return scheduledResponse;

    // ... (باقي الكود بتاعك زي ما هو بالظبط) ...
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
    const pathname = request.nextUrl.pathname

    const isUserProtected = pathname.startsWith('/account')
    const isAdminProtected = pathname.startsWith('/admin/dashboard')

    // 1. حماية المستخدمين (لو مش مسجل يروح للوجين)
    if (!user && isUserProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    // 2. حماية الأدمن (لو مش مسجل يروح للوجين الأدمن)
    // ملاحظة: التحقق من إنه "أدمن فعلاً" بيحصل في الـ APIs (Server-side) وفي الـ admin-context (Client-side)
    // عشان منبطأش الـ Proxy بـ Database Queries
    if (!user && isAdminProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }

    // 3. منع الـ Open Redirect في اللوجين (تعديلك العبقري)
    if (user && pathname === '/login') {
        let next = request.nextUrl.searchParams.get('next') || '/account'

        // ✅ تأمين: نمنع أي URL خارجي
        if (!next.startsWith('/') || next.startsWith('//')) {
            next = '/account'
        }

        return NextResponse.redirect(new URL(next, request.url))
    }

    return response
}

export const config = {
    // ✅ استثنينا /api والملفات الثابتة عشان نحسن السرعة
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}