import DiscordAvatar from "@/components/DiscordAvatar";
import Header from "@/components/Header";
import Pills from "@/components/Pills";
import type { AppearanceCard, SiteConfig } from "@/lib/siteConfig";

/**
 * The hero, drawn from `site.appearance`:
 *
 * - `classic`   — portrait first, then the name block and the card
 * - `modern`    — one wide card with a banner and the picture beside the name
 * - `portfolio` — the name block and card, then full-screen sections to scroll
 *
 * `card` picks whether the bio sits in a glass card, straight on the page, or
 * in two columns; `align` moves the whole block around (phones stay centered).
 */
function CardArea({
    card,
    bio,
    pills,
}: {
    card: AppearanceCard;
    bio: React.ReactNode;
    pills: React.ReactNode;
}) {
    if (card === "two") {
        return (
            <div className="hero-card">
                <span className="hero-card-rule" aria-hidden="true" />
                <div>{bio}</div>
                <div className="hero-side">{pills}</div>
            </div>
        );
    }
    return (
        <div className="hero-card">
            {card === "card" && (
                <span className="hero-card-rule" aria-hidden="true" />
            )}
            {bio}
        </div>
    );
}

export default function HeroSection({ site }: { site: SiteConfig }) {
    const { layout, card, align } = site.appearance;
    // 0 hides the picture; the modern card starts it a little smaller so the
    // banner still reads on top of it.
    const portrait = site.appearance.avatar;
    const modernPortrait = Math.max(24, Math.round(portrait * 0.78));

    const bio = (
        <p className="hero-bio">
            i&#x27;m a{" "}
            {site.age > 0 && (
                <span className="text-white/90 font-medium">
                    {site.age} yo{" "}
                </span>
            )}
            <span className="text-white/90 font-medium">{site.role}</span>{" "}
            building things with modern web tech. focused on minimal
            architectures and purposeful software. check out my{" "}
            <a
                className="text-white/90 font-medium hover:text-white transition-colors"
                href="#projects"
            >
                projects
            </a>{" "}
            or find me on{" "}
            <a
                href={`https://discord.com/users/${site.socials.discord}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 font-medium hover:text-white transition-colors"
            >
                discord
            </a>
            ,{" "}
            <a
                href={site.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 font-medium hover:text-white transition-colors"
            >
                github
            </a>{" "}
            or{" "}
            <a
                href={site.socials.lastfm}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 font-medium hover:text-white transition-colors"
            >
                last.fm
            </a>{" "}
            — or sign the{" "}
            <a
                className="text-white/90 font-medium hover:text-white transition-colors"
                href="#guestbook"
            >
                guestbook
            </a>
            .
        </p>
    );

    const pills = (
        <div data-reveal="" className="hero-pills w-full">
            <Pills />
        </div>
    );

    const identity = (
        <div className="hero-identity w-full">
            <Header />
        </div>
    );

    const spread = align === "spread";

    return (
        <section id="home" data-section className="hero-section">
            <div className="hero-inner">
                {layout === "modern" ? (
                    <div className="hero-card hero-modern">
                        <span className="hero-banner" aria-hidden="true" />
                        {card !== "none" && (
                            <span className="hero-card-rule" aria-hidden="true" />
                        )}
                        <div className="hero-modern-head">
                            {portrait > 0 && (
                                <span className="hero-modern-avatar">
                                    <DiscordAvatar size={modernPortrait} />
                                </span>
                            )}
                            <div className="hero-modern-body">{identity}</div>
                        </div>
                        <div className="mt-3 flex flex-col gap-3">{bio}</div>
                        <div className="mt-3">{pills}</div>
                    </div>
                ) : (
                    <>
                        {layout === "classic" && portrait > 0 && (
                            <span className="hero-portrait">
                                <span className="hero-avatar">
                                    <DiscordAvatar size={portrait} />
                                </span>
                            </span>
                        )}
                        {spread ? (
                            <div className="hero-chip">
                                {identity}
                                {pills}
                            </div>
                        ) : (
                            identity
                        )}
                        <CardArea card={card} bio={bio} pills={pills} />
                        {!spread && card !== "two" && pills}
                    </>
                )}
            </div>
        </section>
    );
}
