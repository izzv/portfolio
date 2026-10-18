import type { Metadata } from "next";
import "./hero.css";
import "./fonts.css";
import "./globals.css";
// utility sheet generated for the admin markup (see the file header)
import "./admin-utilities.css";
import "./admin.css";
import "./cover.css";
import "./player.css";
import "./palette.css";
import "./guestbook.css";
import "./commissions.css";
import "./nav.css";
import ExperienceProvider from "@/components/ExperienceProvider";
import PreviewProvider from "@/components/PreviewProvider";
import BlossomBackground from "@/components/BlossomBackground";
import CoverBackdrop from "@/components/CoverBackdrop";
import CanvasBackdrop from "@/components/CanvasBackdrop";
import DynamicIsland from "@/components/DynamicIsland";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import Views from "@/components/Views";
import ColorOverlay from "@/components/ColorOverlay";
import SiteProvider from "@/components/SiteProvider";
import CommandPalette from "@/components/CommandPalette";
import { getSite } from "@/lib/siteStore";
import { getProjects } from "@/lib/projectsStore";

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
    const [site, projects] = await Promise.all([getSite(), getProjects()]);
    return (
        <html lang="en" className="dark font-sans hero_YXskvN9J">
            <body className="antialiased bg-black text-white [color-scheme:dark]">
                <SiteProvider config={site}>
                    <ExperienceProvider>
                        <PreviewProvider>
                            <BlossomBackground />
                            <CoverBackdrop />
                            <CanvasBackdrop />
                            <Nav />
                            <DynamicIsland />
                            <PageTransition>{children}</PageTransition>
                            <Views />
                            <ColorOverlay />
                            <CommandPalette projects={projects} />
                        </PreviewProvider>
                    </ExperienceProvider>
                </SiteProvider>
            </body>
        </html>
    );
}
