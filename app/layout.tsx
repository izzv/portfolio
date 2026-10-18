import type { Metadata } from "next";
import "./hero.css";
import "./fonts.css";
import "./globals.css";
// utility sheet generated for the admin markup (see the file header)
import "./admin-utilities.css";
import "./admin.css";
import ExperienceProvider from "@/components/ExperienceProvider";
import BlossomBackground from "@/components/BlossomBackground";
import CanvasBackdrop from "@/components/CanvasBackdrop";
import DynamicIsland from "@/components/DynamicIsland";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import Views from "@/components/Views";
import ColorOverlay from "@/components/ColorOverlay";
import SiteProvider from "@/components/SiteProvider";
import { getSite } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const site = await getSite();
    return {
        title: `${site.name}`,
        description: `${site.name}'s portfolio website`,
        icons: { icon: "/favicon.svg" },
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const site = await getSite();
    return (
        <html lang="en" className="dark font-sans hero_YXskvN9J">
            <body className="antialiased bg-black text-white [color-scheme:dark]">
                <SiteProvider config={site}>
                    <ExperienceProvider>
                        <BlossomBackground />
                        <CanvasBackdrop />
                        <Nav />
                        <DynamicIsland />
                        <PageTransition>{children}</PageTransition>
                        <Views />
                        <ColorOverlay />
                    </ExperienceProvider>
                </SiteProvider>
            </body>
        </html>
    );
}
