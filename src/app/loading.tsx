export default function Loading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream">
            <div className="w-12 h-12 border-4 border-charcoal/10 border-t-gold rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal/60 font-medium animate-pulse">جاري التحميل...</p>
        </div>
    );
}