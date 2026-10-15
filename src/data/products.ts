export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export type ProductSizes = {
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
};

export type ProductColorVariant = {
    name: string;
    hex: string;
    image: string;
    sizes: ProductSizes;
};

export type Product = {
    id: number;
    name: string;
    nameEn: string;
    price: number;
    image: string;
    category: "men" | "women" | "kids";
    description: string;
    isFeatured?: boolean;
    stock: number;
    sizes: ProductSizes;
    colors: ProductColorVariant[];
};

const defaultSizes: ProductSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

export const products: Product[] = [
    {
        id: 1,
        name: "قميص كتان كلاسيك",
        nameEn: "Classic Linen Shirt",
        price: 450,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
        category: "men",
        description: "قميص كتان عالي الجودة، مريح وأنيق. مثالي للإطلالات النهارية والمسائية.",
        isFeatured: true,
        stock: 50,
        sizes: { ...defaultSizes, S: 10, M: 15, L: 15, XL: 10 },
        colors: [],
    },
    {
        id: 2,
        name: "فستان صيفي أنيق",
        nameEn: "Elegant Summer Dress",
        price: 680,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        category: "women",
        description: "فستان صيفي بتصميم انسيابي وألوان نابضة. مثالي للمناسبات النهارية.",
        isFeatured: true,
        stock: 50,
        sizes: { ...defaultSizes, S: 12, M: 18, L: 12, XL: 8 },
        colors: [],
    },
    {
        id: 3,
        name: "جاكيت جينز عصري",
        nameEn: "Modern Denim Jacket",
        price: 850,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
        category: "men",
        description: "جاكيت جينز بتصميم عصري يناسب كل الإطلالات. خامة متينة وتفاصيل دقيقة.",
        isFeatured: true,
        stock: 50,
        sizes: { ...defaultSizes, S: 10, M: 20, L: 10, XL: 10 },
        colors: [],
    },
    {
        id: 4,
        name: "بلوزة حرير ناعمة",
        nameEn: "Soft Silk Blouse",
        price: 520,
        image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
        category: "women",
        description: "بلوزة حرير فاخرة بملمس ناعم. تصميم أنيق يصلح للعمل والمناسبات.",
        isFeatured: true,
        stock: 50,
        sizes: { ...defaultSizes, S: 15, M: 20, L: 15 },
        colors: [],
    },
    {
        id: 5,
        name: "تيشيرت قطن أساسي",
        nameEn: "Basic Cotton Tee",
        price: 180,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        category: "men",
        description: "تيشيرت قطن 100% بتصميم كلاسيكي. مثالي للاستخدام اليومي.",
        stock: 50,
        sizes: { ...defaultSizes, S: 20, M: 20, L: 10 },
        colors: [],
    },
    {
        id: 6,
        name: "تنورة بليسيه",
        nameEn: "Pleated Skirt",
        price: 420,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
        category: "women",
        description: "تنورة بليسيه بتصميم راقٍ. مثالية للإطلالات الكلاسيكية والعصرية.",
        stock: 50,
        sizes: { ...defaultSizes, S: 15, M: 20, L: 15 },
        colors: [],
    },
    {
        id: 7,
        name: "تيشيرت أطفال ملون",
        nameEn: "Kids Colorful Tee",
        price: 150,
        image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
        category: "kids",
        description: "تيشيرت قطني مريح للأطفال بألوان زاهية. مثالي للعب والحركة اليومية.",
        stock: 50,
        sizes: { ...defaultSizes, S: 25, M: 25 },
        colors: [],
    },
    {
        id: 8,
        name: "جاكيت أطفال شتوي",
        nameEn: "Kids Winter Jacket",
        price: 380,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80",
        category: "kids",
        description: "جاكيت شتوي دافي للأطفال بتصميم عملي. مقاوم للبرد ومريح في الحركة.",
        stock: 50,
        sizes: { ...defaultSizes, S: 20, M: 20, L: 10 },
        colors: [],
    },
    {
        id: 9,
        name: "فستان بناتي أنيق",
        nameEn: "Girls Elegant Dress",
        price: 320,
        image: "https://images.unsplash.com/photo-1543854589-fdd815f176e0?w=800&q=80",
        category: "kids",
        description: "فستان أنيق للبنات بتصميم مبهج. مثالي للمناسبات والأعياد.",
        stock: 50,
        sizes: { ...defaultSizes, S: 20, M: 20, L: 10 },
        colors: [],
    },
];