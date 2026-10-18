"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import CommissionModal from "./CommissionModal";

export default function CommissionBar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="w-full">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="group relative flex w-full cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-lg border border-white/[0.07] bg-cardColor/30 px-3.5 py-2.5 text-left backdrop-blur-md transition-colors duration-300 hover:border-white/[0.16]"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-px left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out group-hover:opacity-[0.55]"
                        style={{
                            backgroundImage: `url(${site.commission.sponsorIcon})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(24px) saturate(1.05)",
                            opacity: 0.18,
                        }}
                    />
                    <div className="flex items-center gap-2.5">
                        <span className="relative inline-flex size-1.5 shrink-0 items-center justify-center">
                            <span className="absolute inset-0 animate-ping rounded-full bg-white/40 opacity-75" />
                            <span className="relative size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]" />
                        </span>
                        <span className="text-xs tracking-tight text-white/90">
                            taking {site.commission.label}
                        </span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs tracking-tight text-white/55">
                            from{" "}
                            <span className="text-white/85">
                                {site.commission.price}
                            </span>
                        </span>
                        <span className="hidden text-xs text-white/30 sm:inline">
                            ·
                        </span>
                        <span className="relative hidden size-3.5 shrink-0 items-center justify-center sm:inline-flex">
                            <img
                                alt=""
                                className="object-contain h-full w-full"
                                src={site.commission.sponsorIcon}
                            />
                        </span>
                        <span className="hidden text-xs tracking-tight text-white/85 sm:inline">
                            {site.commission.sponsor}
                        </span>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-white/55 transition-colors duration-300 group-hover:text-white/90">
                        inquire
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 512 512"
                            className="size-3 transition-transform duration-300 group-hover:translate-x-0.5"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
                        </svg>
                    </span>
                </button>
            </div>
            <CommissionModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
