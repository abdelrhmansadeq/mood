import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import AIAssistant from "@/components/ai-assistant";
import MobileNav from "@/components/mobile-nav";
import ScrollToTop from "@/components/scroll-to-top";
import { CartProvider } from "@/components/cart-context";
import CartDrawer from "@/components/cart-drawer";
import { ProductsProvider } from "@/components/products-context";
import { AdminProvider } from "@/components/admin-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { AuthProvider } from "@/components/auth-context";
import { ToastProvider } from "@/components/toast-context";
import Toaster from "@/components/toaster";

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

const baseUrl = "https://mood-khaki-beta.vercel.app";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "Mood | متجر الأناقة",
        template: "%s | Mood",
    },
    description:
        "Mood — متجر ملابس عصري بأرقى التصاميم. اكتشف تشكيلة مميزة من الملابس الرجالية والنسائية والأطفال. شحن مجاني للطلبات أكثر من 500 ج.م.",
    keywords: [
        "متجر ملابس",
        "ملابس عصرية",
        "أزياء",
        "Mood",
        "متجر أونلاين",
        "ملابس رجالية",
        "ملابس نسائية",
        "ملابس أطفال",
        "تسوق أونلاين",
        "مصر",
    ],
    authors: [{ name: "Mood" }],
    creator: "Mood",
    publisher: "Mood",
    openGraph: {
        type: "website",
        locale: "ar_EG",
        url: baseUrl,
        siteName: "Mood",
        title: "Mood | متجر الأناقة",
        description:
            "اكتشف تشكيلة مميزة من الملابس العصرية بتصاميم تناسب ذوقك.",
        images: [
            {
                url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=630&fit=crop",
                width: 1200,
                height: 630,
                alt: "Mood | متجر الأناقة",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Mood | متجر الأناقة",
        description: "اكتشف تشكيلة مميزة من الملابس العصرية.",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=630&fit=crop",
        ],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
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
        <ToastProvider>
            <AuthProvider>
                <ProductsProvider>
                    <AdminProvider>
                        <WishlistProvider>
                            <CartProvider>
                                <Navbar />
                                <CartDrawer />
                                <WhatsAppButton />
                                <AIAssistant />
                                <ScrollToTop />
                                <Toaster />
                                <main className="pt-24 pb-20 md:pb-0 min-h-screen">
                                    {children}
                                </main>
                                <Footer />
                                <MobileNav />
                            </CartProvider>
                        </WishlistProvider>
                    </AdminProvider>
                </ProductsProvider>
            </AuthProvider>
        </ToastProvider>
        </body>
        </html>
    );
}