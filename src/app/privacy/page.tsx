import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "سياسة الخصوصية",
    description:
        "سياسة الخصوصية في متجر Mood — كيف نجمع ونستخدم ونحمي معلوماتك الشخصية.",
    robots: {
        index: false,
        follow: true,
    },
};

// باقي الكود...

export default function PrivacyPage() {
    const sections = [
        {
            title: "1. المعلومات اللي بنجمعها",
            content:
                "لما تستخدم Mood، بنجمع معلومات أساسية زي الاسم، الإيميل، رقم التليفون، والعنوان — وده عشان نقدر نوصّل الطلب. بنحتفظ بيها بشكل آمن ومش بنشاركها مع أي طرف تالت.",
        },
        {
            title: "2. إزاي بنستخدم معلوماتك",
            content:
                "بنستخدم معلوماتك عشان: معالجة الطلبات، التواصل معاك بخصوص الطلب، تحسين تجربة التسوق، وإرسال عروض (لو وافقت).",
        },
        {
            title: "3. حماية البيانات",
            content:
                "بنستخدم تقنيات تشفير حديثة عشان نحمي بياناتك. الوصول لمعلوماتك محدود بس للأشخاص اللي محتاجينها لأداء عملهم.",
        },
        {
            title: "4. الكوكيز",
            content:
                "الموقع بيستخدم الكوكيز عشان يحسّن تجربتك ويفتكر تفضيلاتك. تقدر تعطّلها من إعدادات المتصفح في أي وقت.",
        },
        {
            title: "5. حقوقك",
            content:
                "عندك الحق إنك تطلب نسخة من بياناتك، تعدّلها، أو تمسحها. للتواصل، ابعتلنا على abdelrhman@gmail.com.",
        },
        {
            title: "6. التعديلات",
            content:
                "ممكن نحدّث سياسة الخصوصية من وقت للتاني. أي تعديل هيتم نشره على الصفحة دي بتاريخ التحديث.",
        },
    ];

    return (
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
            <div className="mb-12">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                    Privacy Policy
                </p>
                <h1 className="text-4xl font-bold text-charcoal mb-3">
                    سياسة الخصوصية
                </h1>
                <p className="text-muted text-sm">آخر تحديث: أكتوبر 2026</p>
            </div>

            <p className="text-charcoal/80 leading-relaxed mb-10">
                خصوصيتك تهمنا. الصفحة دي بتوضّح إزاي بنجمع ونستخدم ونحمي معلوماتك الشخصية لما تستخدم موقع Mood.
            </p>

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