"use client";

import type { CSSProperties } from "react";
import { appearanceVars } from "@/lib/appearance";
import type { SiteConfig } from "@/lib/siteConfig";

/**
 * A live mini-hero for /admin → appearance.
 *
 * It is the same stack the public hero uses — the same `appearanceVars`, the
 * same `data-*` attributes and the same `.hero-*` rules from
 * `app/appearance.css` — just boxed smaller by the `.pv` scope in
 * `app/admin.css`. Nothing here is a copy of the look, so a knob that changes
 * the site changes this preview in the same frame.
 */
export default function AppearancePreview({
    site,
    look,
}: {
    site: SiteConfig;
    look: SiteConfig["appearance"];
}) {
    const face = Math.max(22, Math.round(look.avatar * 0.72));
    const initials = (site.name || "y").trim().slice(0, 1).toLowerCase();

    const identity = (
        <>
            <span className="pv-greet">{site.greeting || "hey visitor"}</span>
            <span className="hero-name pv-name">
                {site.name || "your name"}
                {look.textEffect !== "none" && (
                    <span className="type-caret pv-caret" aria-hidden="true" />
                )}
            </span>
            <span className="pv-handle">
                <span className="pv-dot" style={{ width: 12, height: 12 }}>
                    {initials}
                </span>
                @{site.socials.discordHandle || "handle"}
            </span>
        </>
    );

    const bio = (
        <p className="hero-bio pv-bio">
            i&apos;m a{" "}
            <span className="pv-strong">{site.role || "full stack dev"}</span>{" "}
            building things with modern web tech. focused on minimal
            architectures and purposeful software.
        </p>
    );

    const pills = (
        <span className="pv-pills">
            {["discord", "github", "telegram", "last.fm"].map((p) => (
                <span className="pv-pill" key={p}>
                    {p}
                </span>
            ))}
        </span>
    );

    return (
        <div
            className="pv"
            aria-hidden="true"
            style={appearanceVars(look) as CSSProperties}
            data-layout={look.layout}
            data-card={look.card}
            data-align={look.align}
            data-name-upper={look.nameUpper ? "on" : "off"}
            data-studs={look.studs ? "on" : "off"}
        >
            <div className="pv-body">
                <div className="hero-section">
                    <div className="hero-inner">
                        {look.layout === "modern" ? (
                            <div className="hero-card hero-modern">
                                <span className="hero-banner" />
                                {look.card !== "none" && (
                                    <span className="hero-card-rule" />
                                )}
                                <div className="hero-modern-head">
                                    {look.avatar > 0 && (
                                        <span className="hero-modern-avatar">
                                            <span
                                                className="pv-face"
                                                style={{ width: face, height: face }}
                                            >
                                                {initials}
                                            </span>
                                        </span>
                                    )}
                                    <span className="hero-modern-body pv-id">
                                        {identity}
                                    </span>
                                </div>
                                {bio}
                                {pills}
                            </div>
                        ) : (
                            <>
                                {look.layout === "classic" && look.avatar > 0 && (
                                    <span className="hero-portrait">
                                        <span className="hero-avatar">
                                            <span
                                                className="pv-face"
                                                style={{ width: face, height: face }}
                                            >
                                                {initials}
                                            </span>
                                        </span>
                                    </span>
                                )}
                                <span className="pv-id">{identity}</span>
                                <div className="hero-card">
                                    {look.card === "card" && (
                                        <span className="hero-card-rule" />
                                    )}
                                    {look.card === "two" ? (
                                        <>
                                            <div>{bio}</div>
                                            <div className="hero-side">{pills}</div>
                                        </>
                                    ) : (
                                        <>
                                            {bio}
                                            {pills}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
