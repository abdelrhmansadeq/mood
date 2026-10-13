import Link from "next/link";
import type { Product } from "@/data/products";

type Props = {
    product: Product;
};

export default function ProductCard({ product }: Props) {
    return (
        <Link
            href={`/products/${product.id}`}
            className="group block bg-white rounded-lg overflow-hidden border border-charcoal/5 hover:border-gold/30 transition-all duration-300 hover:shadow-lg"
        >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-gold transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-muted mb-2">{product.nameEn}</p>
                <p className="text-base font-semibold text-charcoal">
                    {product.price} <span className="text-xs">ج.م</span>
                </p>
            </div>
        </Link>
    );
}