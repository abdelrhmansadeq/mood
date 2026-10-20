import Link from "next/link";

export default function MaintenancePage() {
    const storePhone = "201014766903";
    const waMessage = encodeURIComponent("مرحباً، أنا محتاج مساعدة عاجلة من متجر Mood.");
    const waLink = `https://wa.me/${storePhone}?text=${waMessage}`;

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center animate-fade-in">
            {/* الأيقونة */}
            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C89B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
            </div>

            {/* النص */}
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">
                معلش، إحنا بنجدد كمان شوية!
            </h1>
            <p className="text-muted text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
                بنعمل بعض التحديثات السريعة عشان نقدملك تجربة أفضل. هتلاقينا راجعين بأحلى تشكيلة في أقرب وقت.
            </p>

            {/* الأزرار */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-8">
                {/* زرار تحديث الصفحة */}
                <Link
                    href="/"
                    className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                    تحديث الصفحة
                </Link>

                {/* زرار واتساب */}
                <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 411.1c-33.9 0-67.1-9.1-95.9-26.3l-6.9-4.1-71.2 18.7 19.1-69.4-4.5-7.1c-18.9-30.1-28.9-64.6-28.9-100.5 0-102 83.2-185 185.1-185 49.4 0 95.9 19.3 130.8 54.3 34.8 34.9 54.1 81.4 54.1 130.8 0 102-83.2 185.1-185.1 185.1zm101.5-138.4c-5.6-2.8-33.1-16.3-38.2-18.2-5.1-1.9-8.9-2.8-12.6 2.8-3.7 5.6-14.5 18.2-17.8 21.9-3.3 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.6-8.7-45-27.7-16.6-14.8-27.8-33.1-31.1-38.7-3.3-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.6-6.5 8.4-9.8 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.8-1.4-2.8-12.6-30.4-17.3-41.5-4.6-11.1-9.2-9.6-12.6-9.8-3.3-.2-7.1-.2-10.8-.2-3.7 0-9.8 1.4-14.9 6.9-5.1 5.6-19.6 19.1-19.6 46.7 0 27.6 20 54.3 22.8 58 2.8 3.7 39.4 60.2 95.5 84.3 13.3 5.8 23.8 9.2 31.9 11.8 13.4 4.3 25.6 3.7 35.2 2.2 10.7-1.7 33.1-13.5 37.7-26.6 4.6-13 4.6-24.1 3.2-26.6-1.4-2.5-5.1-4.1-10.7-6.9z"/></svg>
                    تواصل معنا
                </a>
            </div>

            <p className="text-xs text-gold font-bold tracking-wider uppercase">Mood Store Team</p>
        </div>
    );
}