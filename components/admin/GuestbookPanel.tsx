"use client";

import { useState } from "react";
import type { GuestEntry } from "@/lib/guestbook";
import { IconButton, Pill, Section } from "./ui";

export default function GuestbookPanel({
    initial,
}: {
    initial: GuestEntry[];
}) {
    const [entries, setEntries] = useState<GuestEntry[]>(initial);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<number | null>(null);

    const pending = entries.filter((e) => !e.approved).length;
    const approved = entries.length - pending;

    async function save(next: GuestEntry[]) {
        if (busy) return;
        const previous = entries;
        setEntries(next);
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/guestbook", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entries: next }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                entries?: GuestEntry[];
                error?: string;
                detail?: string;
            };
            if (!res.ok || !data.entries) {
                throw new Error(
                    [data.error, data.detail].filter(Boolean).join(" — ") ||
                        `save failed (${res.status})`,
                );
            }
            setEntries(data.entries);
            setSavedAt(Date.now());
        } catch (e: unknown) {
            setEntries(previous);
            setError(e instanceof Error ? e.message : "save failed");
        } finally {
            setBusy(false);
        }
    }

    function toggleApproved(entry: GuestEntry) {
        void save(
            entries.map((e) =>
                e.id === entry.id ? { ...e, approved: !e.approved } : e,
            ),
        );
    }

    function remove(entry: GuestEntry) {
        if (
            !window.confirm(
                `delete ${entry.name}'s note? this cannot be undone.`,
            )
        )
            return;
        void save(entries.filter((e) => e.id !== entry.id));
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="guestbook"
                description="notes people left on /guestbook. nothing is public until you approve it."
                delay={0}
                badge={
                    <Pill tone={pending ? "warn" : "good"}>
                        {pending ? `${pending} pending` : "all clear"}
                    </Pill>
                }
            >
                <div className="flex flex-wrap items-center gap-2">
                    <Pill>{entries.length} total</Pill>
                    <Pill>{approved} live</Pill>
                    {savedAt && (
                        <Pill>
                            saved{" "}
                            {new Date(savedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Pill>
                    )}
                    {busy && <Pill>saving…</Pill>}
                </div>

                {error && (
                    <p className="mt-3 rounded-lg border border-red-400/25 bg-red-400/[0.07] px-3 py-2 text-xs text-red-200/90">
                        {error}
                    </p>
                )}

                <ul className="mt-3 flex flex-col gap-2">
                    {entries.length === 0 && (
                        <li className="rounded-lg border border-dashed border-white/[0.08] px-3 py-6 text-center text-[11px] text-white/30">
                            no notes yet — the form is live at /guestbook.
                        </li>
                    )}
                    {entries.map((entry, i) => (
                        <li
                            key={entry.id}
                            className="adm-rise adm-row relative rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                            style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <span className="text-sm font-medium text-white/85">
                                            {entry.name}
                                        </span>
                                        <span className="text-[10px] tabular-nums text-white/30">
                                            {new Date(entry.createdAt)
                                                .toISOString()
                                                .slice(0, 16)
                                                .replace("T", " ")}
                                        </span>
                                        {entry.url && (
                                            <a
                                                href={entry.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="truncate text-[10px] text-white/35 underline decoration-white/15 underline-offset-2 hover:text-white/70"
                                            >
                                                {entry.url.replace(/^https?:\/\//, "")}
                                            </a>
                                        )}
                                    </div>
                                    <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-white/65">
                                        {entry.message}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleApproved(entry)}
                                        disabled={busy}
                                        aria-pressed={entry.approved}
                                        className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40 ${
                                            entry.approved
                                                ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100/75"
                                                : "border-amber-300/25 bg-amber-300/[0.08] text-amber-100/80 hover:border-amber-300/45"
                                        }`}
                                    >
                                        {entry.approved ? "live" : "approve"}
                                    </button>
                                    <IconButton
                                        label={`delete ${entry.name}'s note`}
                                        danger
                                        onClick={() => remove(entry)}
                                        disabled={busy}
                                    >
                                        ✕
                                    </IconButton>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </Section>
        </div>
    );
}
