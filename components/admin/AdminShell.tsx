"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    defaultSite,
    normalizeSite,
    type SiteConfig,
} from "@/lib/siteConfig";
import type { Project } from "@/lib/projects";
import ProjectsAdmin from "./ProjectsAdmin";
import GuestbookPanel from "./GuestbookPanel";
import type { GuestEntry } from "@/lib/guestbook";
import {
    CommissionPanel,
    LinksPanel,
    NavPanel,
    OverviewPanel,
    ProfilePanel,
    SkillsPanel,
    SocialsPanel,
} from "./SitePanels";
import { Pill } from "./ui";

const TABS = [
    { id: "overview", label: "overview" },
    { id: "profile", label: "profile" },
    { id: "socials", label: "socials" },
    { id: "links", label: "links" },
    { id: "skills", label: "skills" },
    { id: "nav", label: "nav" },
    { id: "commission", label: "commissions" },
    { id: "guestbook", label: "guestbook" },
    { id: "projects", label: "projects" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Stats = { views: number; uniqueDevices: number };

type Toast = { id: number; text: string; tone: "good" | "bad" };

export default function AdminShell({
    initial,
    projects,
    guestbook,
    stats,
    storage,
    warning,
    initialTab,
}: {
    initial: SiteConfig;
    projects: Project[];
    guestbook: GuestEntry[];
    stats: Stats;
    storage: string;
    warning: string | null;
    initialTab?: string;
}) {
    const router = useRouter();
    const [saved, setSaved] = useState<SiteConfig>(initial);
    const [draft, setDraft] = useState<SiteConfig>(initial);
    const [tab, setTab] = useState<TabId>(
        TABS.some((t) => t.id === initialTab) ? (initialTab as TabId) : "overview",
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [store, setStore] = useState({ storage, warning });
    const importRef = useRef<HTMLInputElement>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

    const notify = useCallback((text: string, tone: "good" | "bad" = "good") => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ id: Date.now(), text, tone });
        toastTimer.current = setTimeout(() => setToast(null), 2800);
    }, []);

    useEffect(
        () => () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        },
        [],
    );

    const patch = useCallback((partial: Partial<SiteConfig>) => {
        setDraft((prev) => ({ ...prev, ...partial }));
        setError(null);
    }, []);

    const go = useCallback((id: string) => {
        if (!TABS.some((t) => t.id === id)) return;
        setTab(id as TabId);
        try {
            window.history.replaceState(null, "", `/admin?tab=${id}`);
        } catch {}
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Warn before leaving with unsaved edits.
    useEffect(() => {
        if (!dirty) return;
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    const save = useCallback(async () => {
        if (busy || !dirty) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/site", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config: draft }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                config?: SiteConfig;
                error?: string;
                detail?: string;
                storage?: string;
                warning?: string | null;
            };
            if (!res.ok || !data.config) {
                throw new Error(
                    [data.error, data.detail].filter(Boolean).join(" — ") ||
                        `save failed (${res.status})`,
                );
            }
            setSaved(data.config);
            setDraft(data.config);
            setSavedAt(Date.now());
            setStore({
                storage: data.storage || store.storage,
                warning: data.warning ?? null,
            });
            router.refresh();
            notify("saved — live on the site");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "save failed";
            setError(message);
            notify(message, "bad");
        } finally {
            setBusy(false);
        }
    }, [busy, dirty, draft, notify, router, store.storage]);

    // ⌘S / ctrl+S saves.
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                save();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [save]);

    function exportJson() {
        const blob = new Blob([`${JSON.stringify(draft, null, 4)}\n`], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "site.json";
        a.click();
        URL.revokeObjectURL(url);
        notify("exported site.json");
    }

    async function importJson(file: File) {
        try {
            const parsed = JSON.parse(await file.text());
            const config = normalizeSite(
                parsed && typeof parsed === "object" && "config" in parsed
                    ? (parsed as { config: unknown }).config
                    : parsed,
            );
            setDraft(config);
            setError(null);
            notify("imported — review, then save");
        } catch {
            notify("that file isn't valid site json", "bad");
        }
    }

    function resetAll() {
        if (
            !window.confirm(
                "reset every editable field to the shipped defaults? your current draft is lost.",
            )
        )
            return;
        setDraft(defaultSite());
        setError(null);
        notify("draft reset — save to apply");
    }

    function discard() {
        if (!dirty) return;
        setDraft(saved);
        setError(null);
        notify("draft discarded");
    }

    async function logout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
    }

    const tabs = TABS;

    return (
        <div className="adm-root relative min-h-[100dvh] px-4 pb-40 pt-6 sm:px-6 sm:pt-10">
            <div className="adm-aurora" aria-hidden="true">
                <span className="adm-blob adm-blob-a" />
                <span className="adm-blob adm-blob-b" />
                <span className="adm-blob adm-blob-c" />
            </div>

            <div className="relative mx-auto flex w-full max-w-[980px] flex-col gap-4">
                <header className="adm-rise flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-white/60">
                            <span className="h-px w-4 bg-white/50" />
                            <span className="text-[10px] uppercase tracking-[0.2em]">
                                admin
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                            control room
                        </h1>
                        <p className="mt-1 text-[11px] text-white/45">
                            every word, link and pixel of{" "}
                            <a
                                href="/"
                                className="text-white/80 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60"
                            >
                                {draft.name}
                            </a>{" "}
                            — saved straight to the live site.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                        <a
                            href="/"
                            className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-white/55 transition-colors hover:border-white/[0.2] hover:text-white/90"
                        >
                            view site
                        </a>
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-white/55 transition-colors hover:border-white/[0.2] hover:text-white/90"
                        >
                            log out
                        </button>
                    </div>
                </header>

                <div className="adm-rise sticky top-3 z-30" style={{ animationDelay: "60ms" }}>
                    <nav
                        aria-label="Admin sections"
                        className="adm-tabs flex gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-black/40 p-1.5 backdrop-blur-xl [scrollbar-width:none]"
                    >
                        {tabs.map((t) => {
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    aria-current={active ? "page" : undefined}
                                    onClick={() => go(t.id)}
                                    className={`relative shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] transition-[color,background,box-shadow,transform] duration-300 ${
                                        active
                                            ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_8px_20px_-12px_rgba(0,0,0,0.9)]"
                                            : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                                    }`}
                                >
                                    {t.label}
                                    {active && (
                                        <span className="adm-tab-dot absolute -bottom-[3px] left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-white/80" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {error && (
                    <p className="adm-rise rounded-lg border border-red-400/25 bg-red-400/[0.07] px-3 py-2 text-xs text-red-200/90">
                        {error}
                    </p>
                )}

                {store.warning && (
                    <p className="rounded-lg border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2 text-[11px] leading-relaxed text-amber-100/85">
                        {store.warning}
                    </p>
                )}

                <div className="relative">
                    <div className={tab === "overview" ? "adm-panel" : "hidden"}>
                        <OverviewPanel
                            draft={draft}
                            stats={stats}
                            projects={projects.length}
                            storage={store.storage}
                            savedAt={savedAt}
                            dirty={dirty}
                            onJump={go}
                            onExport={exportJson}
                            onImport={() => importRef.current?.click()}
                            onReset={resetAll}
                        />
                    </div>
                    <div className={tab === "profile" ? "adm-panel" : "hidden"}>
                        <ProfilePanel draft={draft} patch={patch} />
                    </div>
                    <div className={tab === "socials" ? "adm-panel" : "hidden"}>
                        <SocialsPanel draft={draft} patch={patch} />
                    </div>
                    <div className={tab === "links" ? "adm-panel" : "hidden"}>
                        <LinksPanel draft={draft} patch={patch} />
                    </div>
                    <div className={tab === "skills" ? "adm-panel" : "hidden"}>
                        <SkillsPanel draft={draft} patch={patch} />
                    </div>
                    <div className={tab === "nav" ? "adm-panel" : "hidden"}>
                        <NavPanel draft={draft} patch={patch} />
                    </div>
                    <div className={tab === "commission" ? "adm-panel" : "hidden"}>
                        <CommissionPanel draft={draft} patch={patch} />
                    </div>
                    <div className={tab === "guestbook" ? "adm-panel" : "hidden"}>
                        <GuestbookPanel initial={guestbook} />
                    </div>
                    <div className={tab === "projects" ? "adm-panel" : "hidden"}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11px] text-white/40">
                                    projects save on their own — this draft is
                                    untouched.
                                </p>
                                <Pill>own save button</Pill>
                            </div>
                            <ProjectsAdmin initial={projects} embedded />
                        </div>
                    </div>
                </div>

                <input
                    ref={importRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) void importJson(file);
                    }}
                />
            </div>

            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    className={`adm-toast fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-lg border px-3 py-2 text-xs shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl ${
                        toast.tone === "bad"
                            ? "border-red-400/30 bg-red-950/70 text-red-100"
                            : "border-emerald-300/25 bg-emerald-950/60 text-emerald-100/90"
                    }`}
                >
                    {toast.text}
                </div>
            )}

            <div className="adm-savebar fixed bottom-20 left-1/2 z-50 -translate-x-1/2 sm:bottom-5">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/70 p-1.5 pl-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                    <span className="flex items-center gap-2 text-[11px]">
                        <span
                            className={`size-1.5 rounded-full transition-colors duration-300 ${
                                busy
                                    ? "animate-pulse bg-white"
                                    : dirty
                                      ? "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.6)]"
                                      : "bg-emerald-300/80 shadow-[0_0_8px_rgba(110,231,183,0.5)]"
                            }`}
                        />
                        <span className="whitespace-nowrap text-white/55">
                            {busy
                                ? "saving…"
                                : dirty
                                  ? "unsaved changes"
                                  : savedAt
                                    ? "saved · live"
                                    : "in sync"}
                        </span>
                    </span>
                    {dirty && (
                        <button
                            type="button"
                            onClick={discard}
                            className="rounded-md px-2 py-1 text-[11px] text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                        >
                            discard
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => void save()}
                        disabled={busy || !dirty}
                        className="adm-save relative overflow-hidden rounded-lg border border-white/20 bg-white/[0.12] px-3 py-1.5 text-[11px] font-medium text-white transition-[background,transform,opacity] duration-200 hover:bg-white/[0.2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        {busy ? "saving…" : "save"}
                        <kbd className="ml-1.5 hidden text-[9px] text-white/40 sm:inline">
                            ⌘S
                        </kbd>
                    </button>
                </div>
            </div>
        </div>
    );
}
