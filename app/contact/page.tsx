import type { Metadata } from "next";
import * as Si from "react-icons/si";
import CopyButton from "@/components/CopyButton";
import DiscordAvatar from "@/components/DiscordAvatar";
import LocalTime from "@/components/LocalTime";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `contact — ${site.name}` };

const OPEN_PATH =
    "M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z";

const BRAND_ICON: Record<
    string,
    React.ComponentType<{ className?: string }> | undefined
> = {
    GitHub: Si.SiGithub,
    Telegram: Si.SiTelegram,
    "Last.fm": Si.SiLastdotfm,
    Roblox: Si.SiRoblox,
};

const OPEN_BTN =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all duration-150 [&_svg]:size-3.5 [&_svg]:shrink-0 bg-cardColor/20 backdrop-blur-md hover:bg-cardColorForeground/30 h-7 text-xs hover:text-brand cursor-pointer text-[#adadad] shadow-[0px_32px_64px_-16px_#0000004c,0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_-8px_16px_-1px_#00000029,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] hover:shadow-[0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] hover:translate-y-[0.5px] active:shadow-[0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] active:translate-y-[1px]";

function OpenIcon() {
    return (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="text-[#737373]"
            style={{ width: 14, height: 14, flexShrink: 0 }}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d={OPEN_PATH} />
        </svg>
    );
}

function SmallCard({
    icon,
    handle,
    note,
    copyAria,
    openAria,
    openHref,
}: {
    icon: React.ReactNode;
    handle: string;
    note: string;
    copyAria: string;
    openAria: string;
    openHref: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-cardColor/20 backdrop-blur-md shadow-[0_0px_40px_-15px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:border-white/[0.12] p-3">
            <div className="pointer-events-none absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative flex items-center gap-3">
                <div
                    className="relative grid shrink-0 place-items-center rounded-lg bg-cardColor text-[#adadad] shadow-[0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] transition-colors group-hover:text-white"
                    style={{ width: 42, height: 42 }}
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium tracking-tight text-white/95 truncate">
                        <span className="text-white/30">@</span>
                        {handle}
                    </div>
                    <p className="text-xs leading-snug text-white/55 line-clamp-1">
                        {note}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <CopyButton value={handle} ariaLabel={copyAria} iconOnly />
                    <a
                        className={OPEN_BTN}
                        style={{ width: 28, height: 28, padding: 0 }}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={openAria}
                        href={openHref}
                    >
                        <OpenIcon />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function ContactPage() {
    return (
        <div className="grid grid-rows-[1fr] items-start justify-items-center min-h-[100dvh] p-4 pb-20 sm:p-24">
            <main className="flex flex-col gap-8 items-start max-w-[680px] w-full">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-[1px] w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                get in touch
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            contact
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-[85%]">
                        open for collabs, questions, or just a hello —
                        discord&#x27;s fastest, but pick whatever works.
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-cardColor/20 backdrop-blur-md shadow-[0_0px_40px_-15px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:border-white/[0.12] p-4">
                        <div className="pointer-events-none absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="relative flex flex-col gap-3.5">
                            <div className="flex items-center gap-3.5">
                                <DiscordAvatar size={48} />
                                <div className="min-w-0 flex-1">
                                    <div className="text-base font-medium tracking-tight text-white/95">
                                        {site.socials.discordHandle ? (
                                            <>
                                                <span className="text-white/30">
                                                    @
                                                </span>
                                                {site.socials.discordHandle}
                                            </>
                                        ) : (
                                            "discord"
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                                        fastest way to reach me :)
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {site.socials.discordHandle && (
                                    <CopyButton
                                        value={site.socials.discordHandle}
                                        label="copy handle"
                                        ariaLabel="Copy Discord handle"
                                    />
                                )}
                                <a
                                    className={`${OPEN_BTN} px-2.5`}
                                    style={{ height: 28 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://discord.com/users/${site.socials.discord}`}
                                >
                                    <OpenIcon />
                                    <span>open</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {site.contacts
                            .filter((c) => c.platform !== "Discord")
                            .map((c) => {
                            const Icon = BRAND_ICON[c.platform];
                            return (
                                <SmallCard
                                    key={c.platform}
                                    icon={Icon ? <Icon className="size-5" /> : null}
                                    handle={c.handle}
                                    note={c.note}
                                    copyAria={`Copy ${c.platform} handle`}
                                    openAria={`Open ${c.platform}`}
                                    openHref={c.url}
                                />
                            );
                            })}
                    </div>
                </div>

                <LocalTime />
            </main>
        </div>
    );
}
