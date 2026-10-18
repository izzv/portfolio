"use client";

import { useEffect, useRef, useState } from "react";

export const INPUT =
    "adm-input w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-sm text-white outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";

export function Field({
    label,
    hint,
    htmlFor,
    className = "",
    children,
}: {
    label: string;
    hint?: string;
    htmlFor?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label
                htmlFor={htmlFor}
                className="mb-1 flex items-baseline justify-between gap-2 text-[10px] uppercase tracking-[0.14em] text-white/40"
            >
                <span>{label}</span>
                {hint && (
                    <span className="font-light normal-case tracking-normal text-white/25">
                        {hint}
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}

export function TextField({
    label,
    value,
    onChange,
    placeholder,
    hint,
    prefix,
    type = "text",
    maxLength,
    className = "",
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    hint?: string;
    prefix?: string;
    type?: string;
    maxLength?: number;
    className?: string;
}) {
    const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
        <Field label={label} hint={hint} htmlFor={id} className={className}>
            <div className="relative flex items-center">
                {prefix && (
                    <span className="pointer-events-none absolute left-2.5 text-sm text-white/30">
                        {prefix}
                    </span>
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${INPUT} ${prefix ? "pl-6" : ""}`}
                />
            </div>
        </Field>
    );
}

export function AreaField({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
    hint,
    className = "",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    hint?: string;
    className?: string;
}) {
    const id = `area-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
        <Field label={label} hint={hint} htmlFor={id} className={className}>
            <textarea
                id={id}
                rows={rows}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`${INPUT} resize-y`}
            />
        </Field>
    );
}

export function Toggle({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="group flex w-full items-center justify-between gap-4 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-left transition-colors duration-200 hover:border-white/[0.14] hover:bg-white/[0.04]"
        >
            <span className="min-w-0">
                <span className="block text-sm text-white/85">{label}</span>
                {hint && (
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-white/40">
                        {hint}
                    </span>
                )}
            </span>
            <span
                className={`adm-toggle relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
                    checked ? "bg-white/80" : "bg-white/[0.12]"
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 size-4 rounded-full transition-[transform,background] duration-300 ${
                        checked
                            ? "translate-x-4 bg-black"
                            : "translate-x-0 bg-white/60"
                    }`}
                />
            </span>
        </button>
    );
}

export function Section({
    title,
    description,
    badge,
    children,
    delay = 0,
}: {
    title: string;
    description?: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <section
            className="adm-rise adm-card relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 backdrop-blur-md"
            style={{ animationDelay: `${delay}ms` }}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <div className="mb-3.5 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-medium tracking-tight text-white/90">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                            {description}
                        </p>
                    )}
                </div>
                {badge}
            </div>
            {children}
        </section>
    );
}

export function IconButton({
    label,
    onClick,
    children,
    danger = false,
    disabled = false,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex h-7 min-w-[26px] items-center justify-center rounded-md px-1.5 text-[11px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-20 ${
                danger
                    ? "text-red-300/70 hover:bg-red-400/10 hover:text-red-200"
                    : "text-white/45 hover:bg-white/[0.08] hover:text-white/90"
            }`}
        >
            {children}
        </button>
    );
}

export function RowTools({
    index,
    total,
    onMove,
    onRemove,
    removeLabel = "delete",
}: {
    index: number;
    total: number;
    onMove: (dir: -1 | 1) => void;
    onRemove: () => void;
    removeLabel?: string;
}) {
    return (
        <div className="flex shrink-0 items-center gap-0.5">
            <IconButton
                label="move up"
                onClick={() => onMove(-1)}
                disabled={index === 0}
            >
                ↑
            </IconButton>
            <IconButton
                label="move down"
                onClick={() => onMove(1)}
                disabled={index === total - 1}
            >
                ↓
            </IconButton>
            <IconButton label={removeLabel} danger onClick={onRemove}>
                ✕
            </IconButton>
        </div>
    );
}

export function AddButton({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="adm-add group inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/[0.14] px-2.5 py-1.5 text-[11px] text-white/50 transition-colors duration-200 hover:border-white/30 hover:text-white/85"
        >
            <span className="text-sm leading-none transition-transform duration-300 group-hover:rotate-90">
                +
            </span>
            {children}
        </button>
    );
}

export function useCountUp(target: number, duration = 850): number {
    const [value, setValue] = useState(0);
    const from = useRef(0);

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            setValue(target);
            return;
        }
        const start = performance.now();
        const origin = from.current;
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const next = Math.round(origin + (target - origin) * eased);
            setValue(next);
            if (t < 1) raf = requestAnimationFrame(tick);
            else from.current = target;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return value;
}

export function Stat({
    label,
    value,
    detail,
    delay = 0,
}: {
    label: string;
    value: number;
    detail?: string;
    delay?: number;
}) {
    const shown = useCountUp(value);
    return (
        <div
            className="adm-rise adm-card relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3"
            style={{ animationDelay: `${delay}ms` }}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full bg-white/[0.04] blur-xl"
            />
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                {label}
            </div>
            <div className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-white/95">
                {shown.toLocaleString()}
            </div>
            {detail && (
                <div className="mt-0.5 text-[10px] text-white/35">{detail}</div>
            )}
        </div>
    );
}

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "good" | "warn" }) {
    const styles =
        tone === "good"
            ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100/80"
            : tone === "warn"
              ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-100/80"
              : "border-white/[0.08] bg-white/[0.03] text-white/50";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] tracking-wide ${styles}`}
        >
            {children}
        </span>
    );
}
