export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg overflow-hidden border border-charcoal/5">
            <div className="aspect-[3/4] bg-charcoal/5 animate-pulse" />
            <div className="p-4 space-y-2">
                <div className="h-4 bg-charcoal/5 rounded animate-pulse" />
                <div className="h-3 bg-charcoal/5 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-charcoal/5 rounded w-1/2 animate-pulse" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}