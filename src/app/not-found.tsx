import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
            <div className="text-center max-w-md">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                    Error 404
                </p>
                <h1 className="text-7xl md:text-8xl font-bold text-charcoal mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-charcoal mb-4">
                    الصفحة غير موجودة
                </h2>
                <p className="text-muted mb-8 leading-relaxed">
                    يبدو إن الصفحة اللي بتدور عليها مش موجودة، أو اتنقلت لمكان تاني.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                        الصفحة الرئيسية
                    </Link>
                    <Link
                        href="/products"
                        className="inline-block border border-charcoal/20 hover:border-charcoal text-charcoal font-medium px-6 py-3 rounded-md transition-colors"
                    >
                        تسوق الآن
                    </Link>
                </div>
            </div>
        </div>
    );
}