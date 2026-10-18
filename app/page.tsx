import Header from "@/components/Header";
import Pills from "@/components/Pills";
import { getSite } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const site = await getSite();
    return (
        <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-[100dvh] p-4 pb-20 sm:p-24">
            <main className="flex flex-col gap-3 items-start max-w-[680px] w-full">
                <Header />

                <div
                    className="lift anim-item bg-cardColor/20 backdrop-blur-md border border-white/[0.05] p-4 rounded-lg shadow-[0_0px_40px_-15px_rgba(0,0,0,0.3)] relative"
                    style={{ animationDelay: "70ms" }}
                >
                    <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <p className="text-sm text-white/80 leading-relaxed">
                        i&#x27;m a{" "}
                        {site.age > 0 && (
                            <span className="text-white/90 font-medium">
                                {site.age} yo{" "}
                            </span>
                        )}
                        <span className="text-white/90 font-medium">
                            {site.role}
                        </span>{" "}
                        building things with modern web tech. focused on minimal
                        architectures and purposeful software. check out my{" "}
                        <a
                            className="text-white/90 font-medium hover:text-white transition-colors"
                            href="/projects"
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
                            href="/guestbook"
                        >
                            guestbook
                        </a>
                        .
                    </p>
                </div>

                <div
                    className="anim-item w-full"
                    style={{ animationDelay: "150ms" }}
                >
                    <Pills />
                </div>
            </main>
        </div>
    );
}
