import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-charcoal text-cream mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* About */}
                    <div>
                        <h3 className="text-2xl font-bold mb-3">Mood</h3>
                        <p className="text-sm text-cream/70 leading-relaxed">
                            متجر ملابس عصري يقدم لك أرقى القطع بتصاميم مميزة.
                            الأناقة تبدأ من هنا.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gold uppercase tracking-wider">
                            روابط سريعة
                        </h4>
                        <ul className="space-y-2 text-sm text-cream/70">
                            <li>
                                <Link href="/products" className="hover:text-gold transition-colors">
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-gold transition-colors">
                                    من نحن
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-gold transition-colors">
                                    تواصل معنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gold uppercase tracking-wider">
                            تواصل
                        </h4>
                        <ul className="space-y-2 text-sm text-cream/70">
                            <li dir="ltr" className="text-right">abdelrhman@gmail.com</li>
                            <li dir="ltr" className="text-right">01014766903</li>
                            <li>دمياط الجديدة، مصر</li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-cream/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-cream/50">
                        © {year} Mood. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex gap-4 text-xs text-cream/50">
                        <Link href="/privacy" className="hover:text-gold transition-colors">
                            سياسة الخصوصية
                        </Link>
                        <Link href="/terms" className="hover:text-gold transition-colors">
                            الشروط والأحكام
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}