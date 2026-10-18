import type { Metadata } from "next";
import "./hero.css";
import "./fonts.css";
import "./globals.css";
import ExperienceProvider from "@/components/ExperienceProvider";
import BlossomBackground from "@/components/BlossomBackground";
import CanvasBackdrop from "@/components/CanvasBackdrop";
import DynamicIsland from "@/components/DynamicIsland";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import Views from "@/components/Views";
import ColorOverlay from "@/components/ColorOverlay";
import { site } from "@/lib/site"

export const metadata: Metadata = {
    title: `${site.name}`,
    description: `${site.name}'s portfolio website`,
    icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark font-sans hero_YXskvN9J">
            <body className="antialiased bg-black text-white [color-scheme:dark]">
                <ExperienceProvider>
                    <BlossomBackground />
                    <CanvasBackdrop />
                    <Nav />
                    <DynamicIsland />
                    <PageTransition>{children}</PageTransition>
                    <Views />
                    <ColorOverlay />
                </ExperienceProvider>
            </body>
        </html>
    );
}
