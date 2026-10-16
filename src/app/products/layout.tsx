import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "كل المنتجات",
    description:
        "اكتشف تشكيلتنا الكاملة من الملابس العصرية — رجالي، نسائي، وأطفال. تسوق أونلاين بأفضل الأسعار.",
    openGraph: {
        title: "كل المنتجات | Mood",
        description: "اكتشف تشكيلتنا الكاملة من الملابس العصرية.",
    },
};

export default function ProductsLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}