import type { Metadata } from "next";
import { Suspense } from "react";
import MusicTabs from "@/components/MusicTabs";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `music — ${site.name}` };

export default function MusicPage() {
    return (
        <div className="grid grid-rows-[1fr] items-start justify-items-center min-h-[100dvh] p-4 pb-20 sm:p-24">
            <main className="flex flex-col gap-8 items-start max-w-[680px] w-full">
                <div className="space-y-4">
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
            </main>
        </div>
    );
}
