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

export type ProductCategory =
    | "men"
    | "women"
    | "kids"
    | "shoes"
    | "accessories";

export type Product = {
    id: number;
    name: string;
    nameEn: string;
    price: number;
    salePrice?: number | null;
    image: string;
    images?: string[];
    category: ProductCategory;
    description: string;
    isFeatured?: boolean;
    stock: number;
    sizes: ProductSizes;
    colors: ProductColorVariant[];
    avgRating?: number;
    reviewsCount?: number;
    soldCount?: number;
};

// ✅ قايمة الفئات بالعربي
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
    men: "رجالي",
    women: "نسائي",
    kids: "أطفال",
    shoes: "أحذية",
    accessories: "إكسسوارات",
};

// ✅ كل الفئات للفلتر والأدمن
export const ALL_CATEGORIES: ProductCategory[] = [
    "men",
    "women",
    "kids",
    "shoes",
    "accessories",
];

export function getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as ProductCategory] || category;
}