import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تواصل معنا",
    description:
        "عندك سؤال أو اقتراح؟ تواصل معنا وهنرد عليك في أقرب وقت. Mood — متجر الأناقة.",
    openGraph: {
        title: "تواصل معنا | Mood",
        description: "عندك سؤال أو اقتراح؟ تواصل معنا.",
    },
};

export default function ContactLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}