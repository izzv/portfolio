"use client";

import { useSite } from "./SiteProvider";

export default function CommissionModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const site = useSite();
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <span className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-xl border border-white/[0.07] bg-[#0c0c0e]/90 shadow-[0px_48px_96px_-24px_rgba(0,0,0,0.7),0px_24px_48px,-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-px left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
                <div className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="relative inline-flex size-2 shrink-0 items-center justify-center">
                                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40 opacity-75" />
                                <span className="relative size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" />
                            </span>
                            <h2 className="text-base font-medium tracking-tight text-white/95">
                                {site.commission.label}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                            <h3 className="text-xs font-medium text-white/50">
                                what i build
                            </h3>
                            <ul className="mt-2 space-y-1.5 text-sm text-white/80">
                                <li className="flex items-center gap-2">
                                    <span className="size-1 shrink-0 rounded-full bg-white/25" />
                                    websites & landing pages
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-1 shrink-0 rounded-full bg-white/25" />
                                    discord bots
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-1 shrink-0 rounded-full bg-white/25" />
                                    web apps & dashboards
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-1 shrink-0 rounded-full bg-white/25" />
                                    api & backend work
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                            <h3 className="text-xs font-medium text-white/50">
                                pricing
                            </h3>
                            <p className="mt-2 text-sm text-white/80">
                                starting from{" "}
                                <span className="font-medium text-white/95">
                                    {site.commission.price}
                                </span>
                                <span className="text-white/40">.</span>{" "}
                                price varies based on scope and complexity.
                            </p>
                        </div>

                        <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.04] p-3">
                            <h3 className="text-xs font-medium text-emerald-100/60">
                                payment
                            </h3>
                            <p className="mt-2 text-sm text-white/85">
                                <span className="font-medium text-emerald-100/95">
                                    crypto only
                                </span>{" "}
                                <span className="text-white/40">—</span>{" "}
                                <span className="text-white/65">
                                    {site.commission.coins}
                                </span>
                            </p>
                            <a
                                href="/commissions"
                                className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/45 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/80"
                            >
                                full commission details
                                <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-5">
                        <a
                            href="/contact"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.1]"
                        >
                            contact me
                            <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 512 512"
                                className="size-3.5"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
