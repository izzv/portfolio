"use client";

import { useState } from "react";

const SHADOW =
    "shadow-[0px_32px_64px_-16px_#0000004c,0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_-8px_16px_-1px_#00000029,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] hover:shadow-[0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] active:shadow-[0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33]";

const COPY_PATH =
    "M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z";

export default function CopyButton({
    value,
    label,
    ariaLabel,
    iconOnly = false,
}: {
    value: string;
    label?: string;
    ariaLabel: string;
    iconOnly?: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const cls =
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all duration-150 bg-cardColor/20 backdrop-blur-md hover:bg-cardColorForeground/30 text-xs hover:text-brand cursor-pointer text-[#adadad] " +
        SHADOW +
        " hover:translate-y-[0.5px] active:translate-y-[1px] " +
        (iconOnly ? "" : "px-2.5");

    return (
        <button
            className={cls}
            aria-label={ariaLabel}
            style={
                iconOnly
                    ? { width: 28, height: 28, padding: 0 }
                    : { height: 28 }
            }
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1400);
                } catch {}
            }}
        >
            <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 448 512"
                className="text-[#737373]"
                style={{ width: 14, height: 14, flexShrink: 0 }}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d={COPY_PATH} />
            </svg>
            {!iconOnly && <span>{copied ? "copied!" : label}</span>}
        </button>
    );
}
