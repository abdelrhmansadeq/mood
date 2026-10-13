import Link from "next/link";

export default function AboutPage() {
    const values = [
        {
            title: "جودة",
            desc: "كل قطعة بتختار بعناية من أجود الأقمشة والخامات.",
        },
        {
            title: "أناقة",
            desc: "تصاميم عصرية تواكب أحدث صيحات الموضة العالمية.",
        },
        {
            title: "خدمة",
            desc: "فريق دعم جاهز يساعدك قبل وبعد الشراء.",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            {/* Hero */}
            <div className="text-center mb-16">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                    About Mood
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
                    من نحن
                </h1>
                <p className="text-muted max-w-2xl mx-auto leading-relaxed">
                    Mood هو متجر ملابس عصري، هدفه يقدّم لك أرقى القطع بتصاميم مميزة وأسعار مناسبة. بدأنا بشغف بسيط: نخلي الأناقة في متناول الجميع.
                </p>
            </div>

            {/* Story */}
            <div className="bg-white rounded-lg border border-charcoal/10 p-8 md:p-12 mb-16">
                <h2 className="text-2xl font-bold text-charcoal mb-4">قصتنا</h2>
                <p className="text-charcoal/80 leading-relaxed mb-4">
                    بدأت فكرة Mood من إيمان بسيط: إن الأناقة مش رفاهية، دي أسلوب حياة. عشان كده، اخترنا نبدأ متجر يجمع بين جودة القطع، التصاميم العصرية، وتجربة تسوق سهلة وممتعة.
                </p>
                <p className="text-charcoal/80 leading-relaxed">
                    كل قطعة عندنا بيتم اختيارها بعناية عشان تضمن لك إطلالة مميزة تناسب ذوقك. من التيشيرتات الأساسية للقطع المميزة، هدفنا دايمًا إنك تخرج من عندنا وإنت راضي.
                </p>
            </div>

            {/* Values */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-charcoal mb-8 text-center">
                    قيمنا
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {values.map((v) => (
                        <div
                            key={v.title}
                            className="bg-white rounded-lg border border-charcoal/10 p-6 text-center"
                        >
                            <h3 className="text-lg font-semibold text-gold mb-3">{v.title}</h3>
                            <p className="text-sm text-charcoal/70 leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-charcoal mb-4">
                    جاهز تبدأ التسوق؟
                </h2>
                <Link
                    href="/products"
                    className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-8 py-3 rounded-md transition-colors"
                >
                    تسوق الآن
                </Link>
            </div>
        </div>
    );
}