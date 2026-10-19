import type { Metadata, Viewport } from "next";
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
import "./build.css";
import "./appearance.css";
import "./lego.css";
import ExperienceProvider from "@/components/ExperienceProvider";
import PreviewProvider from "@/components/PreviewProvider";
import BlossomBackground from "@/components/BlossomBackground";
import LegoLoader from "@/components/LegoLoader";
import { accentRgb } from "@/lib/appearance";
import CoverBackdrop from "@/components/CoverBackdrop";
import CanvasBackdrop from "@/components/CanvasBackdrop";
import DynamicIsland from "@/components/DynamicIsland";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import Views from "@/components/Views";
import ColorOverlay from "@/components/ColorOverlay";
import SiteProvider from "@/components/SiteProvider";
import CommandPalette from "@/components/CommandPalette";
import HashScroll from "@/components/HashScroll";
import BuildOnScroll from "@/components/BuildOnScroll";
import { getSite } from "@/lib/siteStore";
import { getProjects } from "@/lib/projectsStore";
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
    themeColor: "#0a0a0a",
    colorScheme: "dark",
};

export async function generateMetadata(): Promise<Metadata> {
    const site = await getSite();
    const url = siteUrl();
    const title = `${site.name} — ${site.role}`;
    const description = `${site.name} — ${site.role}. ${site.tagline}`;
    const keywords = [
        site.name,
        site.role,
        "portfolio",
        "developer",
        ...(site.skills.Languages || []),
        ...(site.skills["Frameworks & Libraries"] || []).slice(0, 4),
    ];
    return {
        metadataBase: new URL(url),
        title,
        description,
        applicationName: site.name,
        authors: [{ name: site.name, url }],
        creator: site.name,
        keywords,
        category: "technology",
        openGraph: {
            type: "website",
            url,
            siteName: site.name,
            title,
            description,
            locale: "en_US",
            images: [
                {
                    url: "/og.png",
                    width: 1200,
                    height: 630,
                    alt: `${site.name} — ${site.role}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og.png"],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true },
        },
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [site, projects] = await Promise.all([getSite(), getProjects()]);
    const look = site.appearance;
    const accent = accentRgb(look.accent);
    const paragraph = accent ? accent.join(", ") : "";
    return (
        <html
            lang="en"
            className="dark font-sans hero_YXskvN9J"
            data-build={look.buildStyle}
        >
            <body className="antialiased bg-black text-white [color-scheme:dark]">
                {/* Gate the build-on-scroll hidden state before first paint. It
                    is skipped entirely when the animation is switched off in
                    /admin → appearance, or when the reader asked for reduced
                    motion; the timer is a failsafe so a broken bundle can never
                    leave the page blank. */}
                {look.motion && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.reveal="on";setTimeout(function(){if(!document.querySelector("[data-reveal].is-built")){document.documentElement.removeAttribute("data-reveal")}},5000)}}catch(e){}`,
                        }}
                    />
                )}
                {/* The LEGO intro plays once per tab session, before first paint,
                    and only when it is switched on and motion is welcome. The
                    timer is a failsafe so the veil can never get stuck. */}
                {look.legoIntro && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("lego-intro")){document.documentElement.dataset.lego="on";sessionStorage.setItem("lego-intro","1");setTimeout(function(){document.documentElement.removeAttribute("data-lego")},2600)}}catch(e){}`,
                        }}
                    />
                )}
                {look.legoIntro && (
                    <LegoLoader
                        glow={
                            accent
                                ? `rgba(${paragraph}, 0.30)`
                                : "rgba(255, 255, 255, 0.12)"
                        }
                        brick={
                            accent
                                ? `rgba(${paragraph}, 0.55)`
                                : "rgba(255, 255, 255, 0.26)"
                        }
                    />
                )}
                <SiteProvider config={site}>
                    <ExperienceProvider accent={look.accent}>
                        <PreviewProvider>
                            {look.scene && (
                                <BlossomBackground
                                    intensity={look.sceneIntensity}
                                    dim={look.backdropDim}
                                />
                            )}
                            <CoverBackdrop />
                            <CanvasBackdrop />
                            <Nav />
                            <HashScroll />
                            <BuildOnScroll />
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
