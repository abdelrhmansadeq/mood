import { NextResponse, type NextRequest } from 'next/server';

export function checkManualMaintenance(request: NextRequest): NextResponse | null {
    // لو المتغير مش موجود أو مش true، مفيش صيانة
    if (process.env.MAINTENANCE_MODE !== 'true') return null;

    const pathname = request.nextUrl.pathname;

    // استثناءات (عشان تقدر تدخل تعدل وتشتغل)
    const isExcluded =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname === '/maintenance';

    if (isExcluded) return null;

    return NextResponse.rewrite(new URL('/maintenance', request.url));
}


//الصيانه اليدويه (الفوريه)