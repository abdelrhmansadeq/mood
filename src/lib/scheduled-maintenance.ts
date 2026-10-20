import { NextResponse, type NextRequest } from 'next/server';

export function checkScheduledMaintenance(request: NextRequest): NextResponse | null {
    const startTime = process.env.MAINTENANCE_START_TIME; // مثلاً "03:00"
    const endTime = process.env.MAINTENANCE_END_TIME;     // مثلاً "04:00"

    // لو المتغيرين مش موجودين، الصيانة المجدولة متعطلة
    if (!startTime || !endTime) return null;

    const pathname = request.nextUrl.pathname;

    const isExcluded =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname === '/maintenance';

    if (isExcluded) return null;

    // حساب الوقت الحالي بالدقايق
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // لو وقت البداية أكبر من وقت النهاية (زي من 23:00 لـ 01:00 - يعني بيعدي منتصف الليل)
    let isActive = false;
    if (startMinutes <= endMinutes) {
        isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
        isActive = currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    if (!isActive) return null;

    return NextResponse.rewrite(new URL('/maintenance', request.url));
}


//الصيانه المجدوله (بوقت محدد)