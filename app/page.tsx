import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import MusicSection from "@/components/sections/MusicSection";
import CommissionsSection from "@/components/sections/CommissionsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import GuestbookSection from "@/components/sections/GuestbookSection";
import BiolinksSection from "@/components/sections/BiolinksSection";
import ContactSection from "@/components/sections/ContactSection";
import { getSite } from "@/lib/siteStore";
import { getProjects } from "@/lib/projectsStore";
import { getGuestbook } from "@/lib/guestbookStore";
import { approvedEntries } from "@/lib/guestbook";
import { siteUrl } from "@/lib/siteUrl";
import { appearanceVars } from "@/lib/appearance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    alternates: { canonical: "/" },
};

export default async function HomePage() {
    const [site, projects, guestbook] = await Promise.all([
        getSite(),
        getProjects(),
        getGuestbook(),
    ]);
    const person = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: site.name,
        jobTitle: site.role,
        description: site.tagline,
        url: siteUrl(),
        knowsAbout: [
            ...(site.skills.Languages || []),
            ...(site.skills["Frameworks & Libraries"] || []),
        ],
        sameAs: [
            site.socials.github,
            site.socials.lastfm,
            `https://t.me/${site.socials.telegram}`,
            `https://discord.com/users/${site.socials.discord}`,
            site.socials.roblox,
        ].filter((u) => typeof u === "string" && u.length > 8),
    };

    const look = site.appearance;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
            />
            {/* one inline style carries every appearance setting to the CSS */}
            <main
                className="site-shell"
                data-layout={look.layout}
                data-card={look.card}
                data-align={look.align}
                data-name-upper={look.nameUpper ? "on" : "off"}
                data-studs={look.studs ? "on" : "off"}
                style={appearanceVars(look) as React.CSSProperties}
            >
                <HeroSection site={site} />
                <ProjectsSection
                    projects={projects}
                    commissionEnabled={site.commission.enabled}
                />
                <MusicSection site={site} />
                <CommissionsSection site={site} />
                <SkillsSection site={site} />
                <GuestbookSection entries={approvedEntries(guestbook)} />
                <BiolinksSection site={site} />
                <ContactSection site={site} />
            </main>
        </>
    );
}
