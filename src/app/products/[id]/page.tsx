import { notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail";
import { products } from "@/data/products";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = products.find((p) => p.id === Number(id));

    if (!product) {
        notFound();
    }

    const related = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return <ProductDetail product={product} related={related} />;
}