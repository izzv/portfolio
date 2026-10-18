"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSite } from "./SiteProvider";

type Entry = {
    id: string;
    group: string;
    label: string;
    hint: string;
    run: () => void;
};

function fuzzy(needle: string, hay: string): number {
    const n = needle.trim().toLowerCase();
    if (!n) return 1;
    const h = hay.toLowerCase();
    let i = 0;
    let score = 0;
    let gap = 0;
    for (const ch of h) {
        if (ch === n[i]) {
            score += 2;
            if (gap) score -= Math.min(gap, 3) * 0.4;
            gap = 0;
            i += 1;
            if (i === n.length) break;
        } else if (i > 0) {
            gap += 1;
        } else {
            score -= 0.15;
        }
    }
    if (i < n.length) return 0;
    if (h.startsWith(n)) score += 4;
    else if (h.includes(` ${n}`)) score += 2;
    return score;
}

export default function CommandPalette({
    projects,
}: {
    projects: { id: string; name: string; description: string; url: string }[];
}) {
    const site = useSite();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const restoreFocus = useRef<HTMLElement | null>(null);

    const close = useCallback(() => {
        setOpen(false);
        setQuery("");
        setActive(0);
        restoreFocus.current?.focus?.();
    }, []);

    const go = useCallback(
        (href: string) => {
            close();
            if (href.startsWith("/")) router.push(href);
            else if (href.startsWith("#")) {
                document.querySelector(href)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            } else window.open(href, "_blank", "noopener,noreferrer");
        },
        [close, router],
    );

    const entries = useMemo<Entry[]>(() => {
        const pages: Entry[] = site.nav
            .filter((n) => !n.hidden)
            .map((n) => ({
                id: `page:${n.href}`,
                group: "pages",
                label: n.label,
                hint: n.href,
                run: () => go(n.href),
            }));
        // A saved nav from before /guestbook existed would otherwise hide the
        // page from the palette as well as the rail.
        for (const [href, label] of [
            ["/guestbook", "Guestbook"],
            ["/commissions", "Commissions"],
        ] as const) {
            if (!pages.some((p) => p.hint === href))
                pages.push({
                    id: `page:${href}`,
                    group: "pages",
                    label,
                    hint: href,
                    run: () => go(href),
                });
        }

        const projectEntries: Entry[] = projects.map((p) => ({
            id: `project:${p.id}`,
            group: "projects",
            label: p.name,
            hint: p.description || "project",
            run: () => go(p.url || "/projects"),
        }));

        const socialEntries: Entry[] = [
            ["Discord", `discord.com/users/${site.socials.discord}`, `https://discord.com/users/${site.socials.discord}`],
            ["GitHub", site.socials.githubHandle, site.socials.github],
            ["Telegram", `@${site.socials.telegram}`, `https://t.me/${site.socials.telegram}`],
            ["Last.fm", site.socials.lastfmHandle, site.socials.lastfm],
            ["Roblox", site.socials.robloxHandle, site.socials.roblox],
        ]
            .filter(([, , href]) => !!href)
            .map(([label, hint, href]) => ({
                id: `social:${label}`,
                group: "socials",
                label,
                hint,
                run: () => go(href),
            }));

        const actions: Entry[] = [
            {
                id: "action:copy-discord",
                group: "actions",
                label: "copy discord handle",
                hint: site.socials.discordHandle,
                run: () => {
                    close();
                    void navigator.clipboard
                        ?.writeText(site.socials.discordHandle)
                        .catch(() => {});
                },
            },
            {
                id: "action:admin",
                group: "actions",
                label: "open the control room",
                hint: "/admin",
                run: () => go("/admin"),
            },
            {
                id: "action:top",
                group: "actions",
                label: "go to the top",
                hint: "scroll",
                run: () => {
                    close();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            },
        ];

        return [...pages, ...projectEntries, ...socialEntries, ...actions];
    }, [site, projects, go, close]);

    const filtered = useMemo(() => {
        if (!query.trim()) return entries;
        return entries
            .map((e) => ({
                e,
                score: Math.max(
                    fuzzy(query, e.label),
                    fuzzy(query, e.hint) * 0.6,
                ),
            }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((x) => x.e);
    }, [entries, query]);

    // ⌘K / ctrl+K anywhere that isn't a text field, plus a custom event so the
    // mobile pill can open it without a keyboard.
    useEffect(() => {
        const isTyping = (el: EventTarget | null) => {
            const node = el as HTMLElement | null;
            if (!node) return false;
            const tag = node.tagName;
            return (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT" ||
                node.isContentEditable
            );
        };
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => {
                    if (!v) restoreFocus.current = document.activeElement as HTMLElement;
                    return !v;
                });
                setQuery("");
                setActive(0);
                return;
            }
            if (e.key === "/" && !isTyping(e.target)) {
                e.preventDefault();
                restoreFocus.current = document.activeElement as HTMLElement;
                setOpen(true);
                setQuery("");
                setActive(0);
            }
        };
        const onOpen = () => {
            restoreFocus.current = document.activeElement as HTMLElement;
            setOpen(true);
            setQuery("");
            setActive(0);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("open-command-palette", onOpen);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("open-command-palette", onOpen);
        };
    }, []);

    useEffect(() => {
        if (!open) return;
        const id = requestAnimationFrame(() => inputRef.current?.focus());
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            cancelAnimationFrame(id);
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        setActive((i) => Math.min(i, Math.max(0, filtered.length - 1)));
    }, [filtered.length]);

    useEffect(() => {
        if (!open) return;
        itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
    }, [active, open, filtered.length]);

    if (!open) return null;

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
            event.preventDefault();
            close();
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) =>
                filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
            );
        } else if (event.key === "Enter") {
            event.preventDefault();
            filtered[active]?.run();
        }
    };

    let lastGroup = "";

    return (
        <div
            className="cmdk-root"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                className="cmdk-panel"
                onKeyDown={onKeyDown}
            >
                <div className="cmdk-input-row">
                    <svg viewBox="0 0 512 512" aria-hidden="true" className="cmdk-search">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                    </svg>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActive(0);
                        }}
                        placeholder="jump to a page, project, social…"
                        aria-label="Search the site"
                        aria-controls="cmdk-list"
                        aria-activedescendant={
                            filtered[active] ? `cmdk-${filtered[active].id}` : undefined
                        }
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <kbd>esc</kbd>
                </div>

                <div id="cmdk-list" role="listbox" className="cmdk-list">
                    {filtered.length === 0 && (
                        <p className="cmdk-empty">nothing matches “{query}”.</p>
                    )}
                    {filtered.map((entry, index) => {
                        const header =
                            entry.group !== lastGroup ? entry.group : null;
                        lastGroup = entry.group;
                        const isActive = index === active;
                        return (
                            <div key={entry.id}>
                                {header && (
                                    <div className="cmdk-group">{header}</div>
                                )}
                                <button
                                    id={`cmdk-${entry.id}`}
                                    ref={(el) => {
                                        itemRefs.current[index] = el;
                                    }}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    data-active={isActive || undefined}
                                    className="cmdk-item"
                                    onMouseMove={() => setActive(index)}
                                    onClick={() => entry.run()}
                                >
                                    <span className="cmdk-label">{entry.label}</span>
                                    <span className="cmdk-hint">{entry.hint}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="cmdk-foot">
                    <span>
                        <kbd>↑</kbd> <kbd>↓</kbd> move
                    </span>
                    <span>
                        <kbd>↵</kbd> open
                    </span>
                    <span>
                        <kbd>esc</kbd> close
                    </span>
                    <span className="cmdk-foot-brand">{site.name}</span>
                </div>
            </div>
        </div>
    );
}
