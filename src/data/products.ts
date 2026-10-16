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
    salePrice?: number | null;
    image: string;
    category: "men" | "women" | "kids";
    description: string;
    isFeatured?: boolean;
    stock: number;
    sizes: ProductSizes;
    colors: ProductColorVariant[];
    avgRating?: number;
    reviewsCount?: number;
    soldCount?: number;
};