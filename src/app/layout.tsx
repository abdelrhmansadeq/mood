import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import AIAssistant from "@/components/ai-assistant";
import { CartProvider } from "@/components/cart-context";
import CartDrawer from "@/components/cart-drawer";
import { ProductsProvider } from "@/components/products-context";
import { AdminProvider } from "@/components/admin-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { AuthProvider } from "@/components/auth-context";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-plex-arabic",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Mood | متجر الأناقة",
    description: "Mood — متجر ملابس عصري. Elegance begins here.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="ar"
            dir="rtl"
            data-scroll-behavior="smooth"
            className={`${inter.variable} ${plexArabic.variable}`}
        >
        <body className="font-arabic bg-cream text-charcoal antialiased">
        <AuthProvider>
            <ProductsProvider>
                <AdminProvider>
                    <WishlistProvider>
                        <CartProvider>
                            <Navbar />
                            <CartDrawer />
                            <WhatsAppButton />
                            <AIAssistant />
                            <main className="pt-24 min-h-screen">{children}</main>
                            <Footer />
                        </CartProvider>
                    </WishlistProvider>
                </AdminProvider>
            </ProductsProvider>
        </AuthProvider>
        </body>
        </html>
    );
}