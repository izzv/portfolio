import { Suspense } from "react";
import MusicTabs from "@/components/MusicTabs";
import Section from "@/components/sections/Section";
import type { SiteConfig } from "@/lib/siteConfig";

export default function MusicSection({ site }: { site: SiteConfig }) {
    return (
        <Section id="music">
            <div data-reveal="" className="space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/70">
                        <span className="h-[1px] w-4 bg-white/50" />
                        <span className="text-xs font-light tracking-wider">
                            my taste
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        music
                    </h1>
                </div>
                <p className="text-white/80 text-sm leading-relaxed max-w-[85%]">
                    what&#x27;s been on repeat for the past month. live from{" "}
                    <a
                        href={site.socials.lastfm}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 font-medium hover:text-white transition-colors"
                    >
                        last.fm
                    </a>
                    .
                </p>
            </div>
            <Suspense fallback={null}>
                <MusicTabs />
            </Suspense>
        </Section>
    );
}
