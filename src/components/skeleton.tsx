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

export function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-charcoal/10 p-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-charcoal/10">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-1.5">
                        <div className="h-3 w-16 bg-charcoal/5 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-charcoal/5 rounded animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-3 w-16 bg-charcoal/5 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-charcoal/5 rounded animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-3 w-16 bg-charcoal/5 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-charcoal/5 rounded animate-pulse" />
                    </div>
                </div>
                <div className="h-7 w-24 bg-charcoal/5 rounded-full animate-pulse" />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="h-4 w-full bg-charcoal/5 rounded animate-pulse" />
                <div className="h-4 w-full bg-charcoal/5 rounded animate-pulse" />
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4 pt-4 border-t border-charcoal/10">
                {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-12 h-14 rounded-md bg-charcoal/5 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-2/3 bg-charcoal/5 rounded animate-pulse" />
                            <div className="h-3 w-1/3 bg-charcoal/5 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-16 bg-charcoal/5 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-charcoal/10 space-y-2">
                <div className="flex justify-between">
                    <div className="h-3 w-12 bg-charcoal/5 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-charcoal/5 rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                    <div className="h-4 w-12 bg-charcoal/5 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-charcoal/5 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <OrderCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function MessageCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-charcoal/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-charcoal/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-charcoal/5 animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-charcoal/5 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-charcoal/5 rounded animate-pulse" />
                    </div>
                </div>
                <div className="h-3 w-20 bg-charcoal/5 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full bg-charcoal/5 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-charcoal/5 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-charcoal/5 rounded animate-pulse" />
            </div>
        </div>
    );
}

export function MessageListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <MessageCardSkeleton key={i} />
            ))}
        </div>
    );
}