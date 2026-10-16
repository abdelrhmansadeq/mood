import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الشروط والأحكام",
    description:
        "الشروط والأحكام لاستخدام متجر Mood — الطلبات، الدفع، الشحن، والإرجاع.",
    robots: {
        index: false,
        follow: true,
    },
};

// باقي الكود...

export default function TermsPage() {
    const sections = [
        {
            title: "1. قبول الشروط",
            content:
                "باستخدامك لموقع Mood، إنت بتوافق على الشروط والأحكام دي. لو مش موافق، نرجو منك عدم استخدام الموقع.",
        },
        {
            title: "2. الطلبات والدفع",
            content:
                "الدفع حاليًا عند الاستلام. بنحتفظ بحق إلغاء أي طلب لو حصلت مشكلة في البيانات أو التوصيل.",
        },
        {
            title: "3. الشحن والتوصيل",
            content:
                "الشحن مجاني للطلبات أكثر من 500 ج.م. مدة التوصيل من 2 إلى 5 أيام عمل حسب المنطقة.",
        },
        {
            title: "4. الإرجاع والاستبدال",
            content:
                "تقدر ترجع المنتج خلال 14 يوم من الاستلام، بشرط إنه يكون بحالته الأصلية وبدون استخدام. مصاريف الإرجاع على العميل إلا لو المنتج فيه عيب صناعة.",
        },
        {
            title: "5. الملكية الفكرية",
            content:
                "كل محتوى الموقع (نصوص، صور، شعار) ملك لـ Mood، وممنوع استخدامه بدون إذن مكتوب.",
        },
        {
            title: "6. المسؤولية",
            content:
                "Mood مش مسؤول عن أي أضرار غير مباشرة ناتجة عن استخدام الموقع، بما يتوافق مع القانون المصري.",
        },
        {
            title: "7. التعديلات",
            content:
                "بنحتفظ بحق تعديل الشروط دي في أي وقت. استمرارك في استخدام الموقع معناه موافقتك على النسخة المحدّثة.",
        },
    ];

    return (
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
            <div className="mb-12">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                    Terms & Conditions
                </p>
                <h1 className="text-4xl font-bold text-charcoal mb-3">
                    الشروط والأحكام
                </h1>
                <p className="text-muted text-sm">آخر تحديث: أكتوبر 2026</p>
            </div>

            <div className="space-y-8">
                {sections.map((s) => (
                    <div key={s.title}>
                        <h2 className="text-lg font-bold text-charcoal mb-3">{s.title}</h2>
                        <p className="text-charcoal/70 leading-relaxed text-sm">{s.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}