export type Product = {
    id: number;
    name: string;
    nameEn: string;
    price: number;
    image: string;
    category: "men" | "women" | "kids";
    description: string;
    isFeatured?: boolean;
};

export const products: Product[] = [
    {
        id: 1,
        name: "قميص كتان كلاسيك",
        nameEn: "Classic Linen Shirt",
        price: 450,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
        category: "men",
        description: "قميص كتان عالي الجودة، مريح وأنيق. مثالي للإطلالات النهارية والمسائية. مصنوع من أقمشة طبيعية تسمح بالتهوية.",
        isFeatured: true,
    },
    {
        id: 2,
        name: "فستان صيفي أنيق",
        nameEn: "Elegant Summer Dress",
        price: 680,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        category: "women",
        description: "فستان صيفي بتصميم انسيابي وألوان نابضة. مثالي للمناسبات النهارية والخروجات الصيفية. خامة خفيفة ومريحة.",
        isFeatured: true,
    },
    {
        id: 3,
        name: "جاكيت جينز عصري",
        nameEn: "Modern Denim Jacket",
        price: 850,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
        category: "men",
        description: "جاكيت جينز بتصميم عصري يناسب كل الإطلالات. خامة متينة وتفاصيل دقيقة. يناسب الجينز والكاجوال.",
        isFeatured: true,
    },
    {
        id: 4,
        name: "بلوزة حرير ناعمة",
        nameEn: "Soft Silk Blouse",
        price: 520,
        image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
        category: "women",
        description: "بلوزة حرير فاخرة بملمس ناعم. تصميم أنيق يصلح للعمل والمناسبات. متوفرة بألوان هادئة.",
        isFeatured: true,
    },
    {
        id: 5,
        name: "تيشيرت قطن أساسي",
        nameEn: "Basic Cotton Tee",
        price: 180,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        category: "men",
        description: "تيشيرت قطن 100% بتصميم كلاسيكي. مثالي للاستخدام اليومي. متوفر بمقاسات متعددة.",
    },
    {
        id: 6,
        name: "تنورة بليسيه",
        nameEn: "Pleated Skirt",
        price: 420,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
        category: "women",
        description: "تنورة بليسيه بتصميم راقٍ. مثالية للإطلالات الكلاسيكية والعصرية. خامة خفيفة وحركة انسيابية.",
    },
];