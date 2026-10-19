import type { Metadata } from "next";
import * as Si from "react-icons/si";
import { getSite } from "@/lib/siteStore";
import type { SiteConfig } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const site = await getSite();
    return {
        title: `biolinks — ${site.name}`,
        description: site.tagline,
        alternates: { canonical: "/biolinks" },
    };
}

const OPEN_PATH =
    "M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z";

function OpenIcon() {
    return (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="embed-pill-out"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d={OPEN_PATH} />
        </svg>
    );
}

type Pill = {
    key: string;
    label: string;
    href: string;
    icon: React.ReactNode;
};

const socials = (site: SiteConfig): Pill[] => [
    {
        key: "discord",
        label: `@${site.socials.discordHandle}`,
        href: `https://discord.com/users/${site.socials.discord}`,
        icon: <Si.SiDiscord className="embed-pill-icon" />,
    },
    {
        key: "github",
        label: `@${site.socials.githubHandle}`,
        href: site.socials.github,
        icon: <Si.SiGithub className="embed-pill-icon" />,
    },
    {
        key: "telegram",
        label: `@${site.socials.telegram}`,
        href: `https://t.me/${site.socials.telegram}`,
        icon: <Si.SiTelegram className="embed-pill-icon" />,
    },
    {
        key: "lastfm",
        label: `@${site.socials.lastfmHandle}`,
        href: site.socials.lastfm,
        icon: <Si.SiLastdotfm className="embed-pill-icon" />,
    },
];

export default async function BiolinksPage() {
    const site = await getSite();
    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 pb-24 sm:p-24">
            <main className="embed-card anim-item w-full max-w-[660px]">
                <span className="embed-strip" aria-hidden="true" />

                <div className="embed-inner">
                    <div className="embed-banner">
                        <span className="embed-wash" aria-hidden="true" />
                        <span className="embed-ring" aria-hidden="true" />
                        <span className="embed-index">/ 01</span>

                        <span className="embed-hero">
                            <span className="embed-name-wrap">
                                <span className="embed-dot" aria-hidden="true" />
                                <h1 className="embed-name">{site.name}</h1>
                            </span>
                            <span className="embed-tagline">
                                {site.tagline}
                            </span>
                        </span>
                    </div>

                    <nav className="embed-links" aria-label="links">
                        {site.biolinks.map((l, i) => (
                            <a
                                key={l.name}
                                href={l.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="embed-pill"
                                style={{
                                    animationDelay: `${120 + i * 55}ms`,
                                }}
                            >
                                {l.img ? (
                                    <img
                                        src={l.img}
                                        alt=""
                                        width={18}
                                        height={18}
                                        className="embed-pill-icon rounded-[4px] object-cover"
                                    />
                                ) : (
                                    <span className="embed-pill-icon grid place-items-center text-[10px] uppercase">
                                        {l.name.slice(0, 1)}
                                    </span>
                                )}
                                <span className="embed-pill-label">
                                    {l.name}
                                </span>
                                <span className="embed-pill-note">
                                    {l.handle}
                                </span>
                                <OpenIcon />
                            </a>
                        ))}

                        {socials(site).map((s, i) => (
                            <a
                                key={s.key}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="embed-pill"
                                style={{
                                    animationDelay: `${
                                        120 +
                                        (site.biolinks.length + i) * 55
                                    }ms`,
                                }}
                            >
                                {s.icon}
                                <span className="embed-pill-label">
                                    {s.label}
                                </span>
                                <OpenIcon />
                            </a>
                        ))}
                    </nav>
                </div>
            </main>
        </div>
    );
}
