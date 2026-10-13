import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
        <html lang="ar" dir="rtl" className={`${inter.variable} ${plexArabic.variable}`}>
        <body className="font-arabic bg-cream text-charcoal antialiased">
        <Navbar />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
        </body>
        </html>
    );
}