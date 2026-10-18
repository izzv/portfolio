import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `biolinks — ${site.name}` };

export default function BiolinksPage() {
    return (
        <div className="flex min-h-[100dvh] flex-col items-center p-4 pb-20 sm:p-24">
            <main className="flex w-full max-w-[680px] flex-col gap-8">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-[1px] w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                link-in-bio
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            biolinks
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-[85%]">
                        everything else lives on these two.
                    </p>
                </div>
                <div className="flex flex-col gap-2.5">
                    {site.biolinks.map((l) => (
                        <a
                            key={l.name}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <article className="relative isolate overflow-hidden rounded-lg border border-white/[0.05] bg-cardColor/20 backdrop-blur-md shadow-[0px_24px_48px_-16px_#00000059,0px_12px_24px_-8px_#0000004c,0px_6px_12px_-4px_#0000003d,0px_3px_6px_-2px_#0000002e,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff26] transition-[border-color,box-shadow] duration-500 ease-out group-hover:border-white/[0.1]">
                                {l.img && (
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out group-hover:opacity-[0.55]"
                                        style={{
                                            backgroundImage: `url(${l.img})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            filter: "blur(20px) saturate(0.85)",
                                            opacity: 0.3,
                                        }}
                                    />
                                )}
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 bg-black/35"
                                />
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -top-px left-[8%] right-[8%] z-20 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                />
                                <div className="relative z-10 flex items-center gap-3 p-3">
                                    <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/[0.08] shadow-[0px_8px_16px_-4px_rgba(0,0,0,0.5)]">
                                        {l.img ? (
                                            <img
                                                src={l.img}
                                                alt={l.name}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                                                {l.name.slice(0, 1)}
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="truncate text-sm font-medium tracking-tight text-white/95">
                                                {l.name}
                                            </h3>
                                            <span className="shrink-0 text-[10px] font-light tabular-nums tracking-wider text-white/55">
                                                {l.handle}
                                            </span>
                                        </div>
                                        {l.note && (
                                            <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                                                {l.note}
                                            </p>
                                        )}
                                    </div>
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 512 512"
                                        className="shrink-0 text-white/35 transition-[color,transform] duration-300 ease-out group-hover:translate-x-0.5 group-hover:text-white/80"
                                        height={14}
                                        width={14}
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z" />
                                    </svg>
                                </div>
                            </article>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
}
