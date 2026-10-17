import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // إنشاء اتصال Supabase في الـ Middleware
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
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // التحقق من الجلسة
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // الصفحات اللي محتاجة تسجيل دخول
    const isUserProtected = pathname.startsWith('/account') || pathname.startsWith('/checkout')
    const isAdminProtected = pathname.startsWith('/admin/dashboard')

    // 1. لو مش مسجل دخول وبيحاول يدخل صفحة محمية للعميل
    if (!user && isUserProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname) // نحفظ مكانه عشان نرجعه له بعد اللوجين
        return NextResponse.redirect(url)
    }

    // 2. لو مش مسجل دخول وبيحاول يدخل لوحة التحكم
    if (!user && isAdminProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin' // صفحة لوجين الأدمن
        return NextResponse.redirect(url)
    }

    return response
}

// تحديد المسارات اللي الـ Middleware هيشتغل عليها (عشان ميبطأش تحميل الصور والملفات)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}