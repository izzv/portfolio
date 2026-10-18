"use client";

import { useState } from "react";
import { NAV_ICON_KEYS, navIcon } from "@/lib/navIcons";
import type { Biolink, Contact, NavItem, SiteConfig } from "@/lib/siteConfig";
import {
    AddButton,
    AreaField,
    Field,
    IconButton,
    INPUT,
    Pill,
    RowTools,
    Section,
    Stat,
    TextField,
    Toggle,
} from "./ui";

export type PanelProps = {
    draft: SiteConfig;
    patch: (partial: Partial<SiteConfig>) => void;
};

function moved<T>(list: T[], index: number, dir: -1 | 1): T[] {
    const next = [...list];
    const target = index + dir;
    if (target < 0 || target >= next.length) return list;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

function Row({
    children,
    delay = 0,
}: {
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <li
            className="adm-rise adm-row relative rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </li>
    );
}

/* ---------------------------------------------------------------- overview */

export function OverviewPanel({
    draft,
    stats,
    projects,
    storage,
    savedAt,
    dirty,
    onJump,
    onExport,
    onImport,
    onReset,
}: {
    draft: SiteConfig;
    stats: { views: number; uniqueDevices: number };
    projects: number;
    storage: string;
    savedAt: number | null;
    dirty: boolean;
    onJump: (tab: string) => void;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}) {
    const socialCount = Object.values(draft.socials).filter(Boolean).length;
    const skillsCount = Object.values(draft.skills).reduce(
        (n, list) => n + list.length,
        0,
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Stat
                    label="views"
                    value={stats.views}
                    detail="all time"
                    delay={0}
                />
                <Stat
                    label="visitors"
                    value={stats.uniqueDevices}
                    detail="unique devices"
                    delay={60}
                />
                <Stat label="projects" value={projects} detail="listed" delay={120} />
                <Stat
                    label="skills"
                    value={skillsCount}
                    detail={`${Object.keys(draft.skills).length} groups`}
                    delay={180}
                />
            </div>

            <Section
                title="live status"
                description="what the public site is currently serving."
                delay={120}
                badge={
                    <Pill tone={dirty ? "warn" : "good"}>
                        {dirty ? "unsaved draft" : "in sync"}
                    </Pill>
                }
            >
                <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                            identity
                        </div>
                        <div className="mt-1 truncate text-sm text-white/85">
                            {draft.name}
                            <span className="text-white/35"> · </span>
                            <span className="text-white/55">{draft.greeting}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-white/40">
                            {draft.tagline}
                        </p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                            links
                        </div>
                        <div className="mt-1 text-sm text-white/85">
                            {draft.biolinks.length} b!o ·{" "}
                            {draft.contacts.length} contacts · {socialCount} socials
                        </div>
                        <p className="mt-0.5 text-[11px] text-white/40">
                            {draft.nav.filter((n) => !n.hidden).length} nav items
                            shown
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill>
                        <span className="size-1.5 rounded-full bg-white/50" />
                        storage: {storage}
                    </Pill>
                    <Pill>
                        {savedAt
                            ? `saved ${new Date(savedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })}`
                            : "not saved this session"}
                    </Pill>
                    <Pill>
                        timezone: {draft.timezone}
                    </Pill>
                </div>
            </Section>

            <Section
                title="jump in"
                description="everything is one save away."
                delay={180}
            >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                        ["profile", "name, greeting, tagline"],
                        ["socials", "discord, github, last.fm"],
                        ["links", "biolinks & contact cards"],
                        ["skills", "sections and pills"],
                        ["nav", "order, labels, icons"],
                        ["commission", "status, price, sponsor"],
                    ].map(([id, hint]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onJump(id)}
                            className="adm-jump group rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-[border-color,background,transform] duration-200 hover:-translate-y-px hover:border-white/[0.16] hover:bg-white/[0.05]"
                        >
                            <span className="flex items-center justify-between text-sm text-white/80">
                                {id}
                                <span className="text-white/25 transition-transform duration-200 group-hover:translate-x-0.5">
                                    →
                                </span>
                            </span>
                            <span className="mt-0.5 block text-[10px] text-white/35">
                                {hint}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onExport}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/70 transition-colors hover:border-white/[0.2] hover:text-white"
                    >
                        ↓ export json
                    </button>
                    <button
                        type="button"
                        onClick={onImport}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/70 transition-colors hover:border-white/[0.2] hover:text-white"
                    >
                        ↑ import json
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-md border border-red-400/20 bg-red-400/[0.05] px-2.5 py-1.5 text-[11px] text-red-200/70 transition-colors hover:border-red-400/40 hover:text-red-100"
                    >
                        reset to defaults
                    </button>
                </div>
            </Section>
        </div>
    );
}

/* ----------------------------------------------------------------- profile */

export function ProfilePanel({ draft, patch }: PanelProps) {
    return (
        <div className="flex flex-col gap-4">
            <Section
                title="hero"
                description="the first thing anyone reads."
                delay={0}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="name"
                        value={draft.name}
                        maxLength={40}
                        placeholder="ryan"
                        onChange={(name) => patch({ name })}
                    />
                    <TextField
                        label="age"
                        type="number"
                        value={draft.age}
                        hint="0 hides it"
                        onChange={(age) => patch({ age: Number(age) || 0 })}
                    />
                    <TextField
                        label="greeting"
                        value={draft.greeting}
                        maxLength={60}
                        placeholder="hey visitor"
                        onChange={(greeting) => patch({ greeting })}
                    />
                    <TextField
                        label="role"
                        value={draft.role}
                        maxLength={60}
                        placeholder="full stack dev"
                        onChange={(role) => patch({ role })}
                    />
                    <TextField
                        label="tagline"
                        value={draft.tagline}
                        maxLength={160}
                        className="sm:col-span-2"
                        onChange={(tagline) => patch({ tagline })}
                    />
                    <TextField
                        label="timezone"
                        value={draft.timezone}
                        hint="IANA name"
                        className="sm:col-span-2"
                        placeholder="America/New_York"
                        onChange={(timezone) => patch({ timezone })}
                    />
                </div>
            </Section>

            <Section
                title="preview"
                description="how the header reads on the home page."
                delay={90}
            >
                <div className="adm-preview relative overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 p-4">
                    <div className="flex items-center gap-2 text-white/70">
                        <span className="h-px w-4 bg-white/50" />
                        <span className="text-xs font-light tracking-wider">
                            {draft.greeting || "hey visitor"}
                        </span>
                    </div>
                    <div className="mt-1 text-2xl font-bold tracking-tight text-white">
                        {draft.name || "your name"}
                    </div>
                    <p className="mt-2 max-w-[85%] text-sm leading-relaxed text-white/70">
                        {draft.age > 0 && (
                            <span className="text-white/90">
                                {draft.age} yo{" "}
                            </span>
                        )}
                        <span className="text-white/90">
                            {draft.role || "what you do"}
                        </span>{" "}
                        {draft.tagline || "your tagline goes here."}
                    </p>
                </div>
            </Section>
        </div>
    );
}

/* ----------------------------------------------------------------- socials */

export function SocialsPanel({ draft, patch }: PanelProps) {
    const socials = draft.socials;
    const set = (key: keyof typeof socials, value: string) =>
        patch({ socials: { ...socials, [key]: value } });

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="discord"
                description="the user id powers the live avatar and presence."
                delay={0}
                badge={<Pill>lanyard</Pill>}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="user id"
                        value={socials.discord}
                        placeholder="1466155972379672871"
                        onChange={(v) => set("discord", v)}
                    />
                    <TextField
                        label="handle"
                        prefix="@"
                        value={socials.discordHandle}
                        placeholder="tv3q"
                        onChange={(v) => set("discordHandle", v)}
                    />
                </div>
            </Section>

            <Section title="profiles" delay={70}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="github url"
                        value={socials.github}
                        placeholder="https://github.com/you"
                        onChange={(v) => set("github", v)}
                    />
                    <TextField
                        label="github handle"
                        value={socials.githubHandle}
                        placeholder="you"
                        onChange={(v) => set("githubHandle", v)}
                    />
                    <TextField
                        label="last.fm url"
                        value={socials.lastfm}
                        placeholder="https://www.last.fm/user/you"
                        onChange={(v) => set("lastfm", v)}
                    />
                    <TextField
                        label="last.fm handle"
                        value={socials.lastfmHandle}
                        placeholder="you"
                        onChange={(v) => set("lastfmHandle", v)}
                    />
                    <TextField
                        label="telegram"
                        prefix="@"
                        value={socials.telegram}
                        placeholder="username"
                        onChange={(v) => set("telegram", v)}
                    />
                    <TextField
                        label="roblox url"
                        value={socials.roblox}
                        placeholder="https://www.roblox.com/users/..."
                        onChange={(v) => set("roblox", v)}
                    />
                    <TextField
                        label="roblox handle"
                        value={socials.robloxHandle}
                        placeholder="username"
                        onChange={(v) => set("robloxHandle", v)}
                    />
                </div>
            </Section>
        </div>
    );
}

/* ------------------------------------------------------------------- links */

export function LinksPanel({ draft, patch }: PanelProps) {
    const setBiolinks = (biolinks: Biolink[]) => patch({ biolinks });
    const setContacts = (contacts: Contact[]) => patch({ contacts });

    function addBiolink() {
        setBiolinks([
            ...draft.biolinks,
            { name: "", handle: "", url: "", img: "", note: "" },
        ]);
    }

    function addContact() {
        setContacts([
            ...draft.contacts,
            { platform: "", handle: "", note: "", action: "open", url: "" },
        ]);
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="biolinks"
                description="the stacked cards on /biolinks. first one renders first."
                delay={0}
                badge={<Pill>{draft.biolinks.length} cards</Pill>}
            >
                <ul className="flex flex-col gap-2.5">
                    {draft.biolinks.map((link, i) => (
                        <Row key={i} delay={i * 35}>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                <TextField
                                    label="name"
                                    value={link.name}
                                    placeholder="wsp.baby"
                                    onChange={(name) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, name } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="handle"
                                    value={link.handle}
                                    placeholder="yo"
                                    onChange={(handle) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, handle } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="url"
                                    value={link.url}
                                    placeholder="https://example.com"
                                    className="sm:col-span-2"
                                    onChange={(url) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, url } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="image url"
                                    value={link.img}
                                    hint="optional"
                                    onChange={(img) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, img } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="note"
                                    value={link.note}
                                    onChange={(note) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, note } : b,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="mt-1 flex justify-end">
                                <RowTools
                                    index={i}
                                    total={draft.biolinks.length}
                                    onMove={(dir) =>
                                        setBiolinks(
                                            moved(draft.biolinks, i, dir),
                                        )
                                    }
                                    onRemove={() =>
                                        setBiolinks(
                                            draft.biolinks.filter(
                                                (_, bi) => bi !== i,
                                            ),
                                        )
                                    }
                                    removeLabel={`delete ${link.name || "link"}`}
                                />
                            </div>
                        </Row>
                    ))}
                </ul>
                <div className="mt-3">
                    <AddButton onClick={addBiolink}>add biolink</AddButton>
                </div>
            </Section>

            <Section
                title="contact cards"
                description="shown on /contact under the discord card."
                delay={90}
                badge={<Pill>{draft.contacts.length} entries</Pill>}
            >
                <ul className="flex flex-col gap-2.5">
                    {draft.contacts.map((contact, i) => (
                        <Row key={i} delay={i * 35}>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                <TextField
                                    label="platform"
                                    value={contact.platform}
                                    placeholder="GitHub"
                                    onChange={(platform) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i
                                                    ? { ...c, platform }
                                                    : c,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="handle"
                                    value={contact.handle}
                                    placeholder="izzv"
                                    onChange={(handle) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i ? { ...c, handle } : c,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="url"
                                    value={contact.url}
                                    className="sm:col-span-2"
                                    placeholder="https://..."
                                    onChange={(url) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i ? { ...c, url } : c,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="note"
                                    value={contact.note}
                                    placeholder="code & projects"
                                    onChange={(note) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i ? { ...c, note } : c,
                                            ),
                                        )
                                    }
                                />
                                <Field label="action">
                                    <select
                                        value={contact.action}
                                        onChange={(e) =>
                                            setContacts(
                                                draft.contacts.map((c, ci) =>
                                                    ci === i
                                                        ? {
                                                              ...c,
                                                              action:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : c,
                                                ),
                                            )
                                        }
                                        className={INPUT}
                                    >
                                        <option value="open">open</option>
                                        <option value="copy handle">
                                            copy handle
                                        </option>
                                    </select>
                                </Field>
                            </div>
                            <div className="mt-1 flex justify-end">
                                <RowTools
                                    index={i}
                                    total={draft.contacts.length}
                                    onMove={(dir) =>
                                        setContacts(
                                            moved(draft.contacts, i, dir),
                                        )
                                    }
                                    onRemove={() =>
                                        setContacts(
                                            draft.contacts.filter(
                                                (_, ci) => ci !== i,
                                            ),
                                        )
                                    }
                                    removeLabel={`delete ${contact.platform || "contact"}`}
                                />
                            </div>
                        </Row>
                    ))}
                </ul>
                <div className="mt-3">
                    <AddButton onClick={addContact}>add contact</AddButton>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-white/30">
                    a contact named “Discord” is left out of the grid, because
                    discord already has its own big card.
                </p>
            </Section>
        </div>
    );
}

/* ------------------------------------------------------------------ skills */

export function SkillsPanel({ draft, patch }: PanelProps) {
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const entries = Object.entries(draft.skills);

    function setSections(next: Record<string, string[]>) {
        patch({ skills: next });
    }

    function rename(index: number, name: string) {
        const next: Record<string, string[]> = {};
        entries.forEach(([key, list], i) => {
            next[i === index ? name : key] = list;
        });
        setSections(next);
    }

    function setItems(index: number, items: string[]) {
        const next: Record<string, string[]> = {};
        entries.forEach(([key, list], i) => {
            next[key] = i === index ? items : list;
        });
        setSections(next);
    }

    function addItem(index: number) {
        const key = entries[index][0];
        const value = (drafts[key] || "").trim();
        if (!value) return;
        setItems(index, [...entries[index][1], value]);
        setDrafts((d) => ({ ...d, [key]: "" }));
    }

    function removeSection(index: number) {
        const next: Record<string, string[]> = {};
        entries.forEach(([key, list], i) => {
            if (i !== index) next[key] = list;
        });
        setSections(next);
    }

    function addSection() {
        const next: Record<string, string[]> = {};
        let name = "new group";
        let n = 2;
        entries.forEach(([key, list]) => {
            next[key] = list;
        });
        while (next[name]) name = `new group ${n++}`;
        next[name] = [];
        setSections(next);
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="skill groups"
                description="each group renders as its own row of pills on /skills."
                delay={0}
                badge={<Pill>{entries.length} groups</Pill>}
            >
                <ul className="flex flex-col gap-3">
                    {entries.map(([key, items], index) => (
                        <Row key={`section-${index}`} delay={index * 45}>
                            <div className="flex items-center gap-2">
                                <input
                                    value={key}
                                    aria-label="group name"
                                    onChange={(e) =>
                                        rename(index, e.target.value)
                                    }
                                    className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-white/85 outline-none transition-colors hover:border-white/10 focus:border-white/25 focus:bg-white/[0.04]"
                                />
                                <span className="shrink-0 text-[10px] tabular-nums text-white/30">
                                    {items.length}
                                </span>
                                <RowTools
                                    index={index}
                                    total={entries.length}
                                    onMove={(dir) => {
                                        if (
                                            (dir === -1 && index === 0) ||
                                            (dir === 1 &&
                                                index === entries.length - 1)
                                        )
                                            return;
                                        const copy = [...entries];
                                        const target = index + dir;
                                        [copy[index], copy[target]] = [
                                            copy[target],
                                            copy[index],
                                        ];
                                        setSections(
                                            Object.fromEntries(copy),
                                        );
                                    }}
                                    onRemove={() => removeSection(index)}
                                    removeLabel={`delete group ${key}`}
                                />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {items.map((item, ii) => (
                                    <span
                                        key={`${item}-${ii}`}
                                        className="adm-chip group inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1 pl-2 pr-1 text-[11px] text-white/70"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            aria-label={`remove ${item}`}
                                            onClick={() =>
                                                setItems(
                                                    index,
                                                    items.filter(
                                                        (_, x) => x !== ii,
                                                    ),
                                                )
                                            }
                                            className="grid size-4 place-items-center rounded text-white/30 transition-colors hover:bg-white/10 hover:text-white/80"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {items.length === 0 && (
                                    <span className="text-[11px] text-white/25">
                                        empty — add one below.
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 flex gap-1.5">
                                <input
                                    value={drafts[key] || ""}
                                    placeholder="add a skill and press enter"
                                    onChange={(e) =>
                                        setDrafts((d) => ({
                                            ...d,
                                            [key]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addItem(index);
                                        }
                                    }}
                                    className={`${INPUT} h-7 py-1 text-xs`}
                                />
                                <button
                                    type="button"
                                    onClick={() => addItem(index)}
                                    className="shrink-0 rounded-md border border-white/[0.1] bg-white/[0.05] px-2 text-[11px] text-white/65 transition-colors hover:bg-white/[0.1] hover:text-white"
                                >
                                    add
                                </button>
                            </div>
                        </Row>
                    ))}
                </ul>
                <div className="mt-3">
                    <AddButton onClick={addSection}>add group</AddButton>
                </div>
            </Section>
        </div>
    );
}

/* --------------------------------------------------------------------- nav */

export function NavPanel({ draft, patch }: PanelProps) {
    const setNav = (nav: NavItem[]) => patch({ nav });

    function update(index: number, partial: Partial<NavItem>) {
        setNav(
            draft.nav.map((item, i) =>
                i === index ? { ...item, ...partial } : item,
            ),
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="navigation"
                description="the floating rail. hidden items stay saved but disappear from the site."
                delay={0}
                badge={<Pill>{draft.nav.filter((n) => !n.hidden).length} visible</Pill>}
            >
                <ul className="flex flex-col gap-2">
                    {draft.nav.map((item, i) => {
                        const icon = navIcon(item.icon);
                        return (
                            <Row key={i} delay={i * 40}>
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="flex items-end gap-2">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.06] ring-1 ring-white/[0.08]">
                                            <svg
                                                stroke="currentColor"
                                                fill="currentColor"
                                                strokeWidth="0"
                                                viewBox={icon.viewBox}
                                                className="size-3.5 text-white/70"
                                                aria-hidden="true"
                                            >
                                                <path d={icon.path} />
                                            </svg>
                                        </span>
                                        <Field label="icon">
                                            <select
                                                value={item.icon}
                                                onChange={(e) =>
                                                    update(i, {
                                                        icon: e.target
                                                            .value as NavItem["icon"],
                                                    })
                                                }
                                                className={`${INPUT} py-1`}
                                            >
                                                {NAV_ICON_KEYS.map((key) => (
                                                    <option key={key} value={key}>
                                                        {key}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                    <div className="min-w-[110px] flex-1">
                                        <TextField
                                            label="label"
                                            value={item.label}
                                            onChange={(label) =>
                                                update(i, { label })
                                            }
                                        />
                                    </div>
                                    <div className="min-w-[140px] flex-[1.4]">
                                        <TextField
                                            label="href"
                                            value={item.href}
                                            onChange={(href) =>
                                                update(i, { href })
                                            }
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            update(i, {
                                                hidden: !item.hidden,
                                            })
                                        }
                                        aria-pressed={item.hidden}
                                        className={`mb-0.5 rounded-md border px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                                            item.hidden
                                                ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-100/70"
                                                : "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100/70"
                                        }`}
                                    >
                                        {item.hidden ? "hidden" : "shown"}
                                    </button>
                                    <div className="mb-0.5">
                                        <RowTools
                                            index={i}
                                            total={draft.nav.length}
                                            onMove={(dir) =>
                                                setNav(moved(draft.nav, i, dir))
                                            }
                                            onRemove={() =>
                                                setNav(
                                                    draft.nav.filter(
                                                        (_, ni) => ni !== i,
                                                    ),
                                                )
                                            }
                                            removeLabel={`delete ${item.label}`}
                                        />
                                    </div>
                                </div>
                            </Row>
                        );
                    })}
                </ul>
                <div className="mt-3">
                    <AddButton
                        onClick={() =>
                            setNav([
                                ...draft.nav,
                                {
                                    label: "New",
                                    href: "/",
                                    icon: "external",
                                    hidden: false,
                                },
                            ])
                        }
                    >
                        add nav item
                    </AddButton>
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------- commission */

export function CommissionPanel({ draft, patch }: PanelProps) {
    const c = draft.commission;
    const set = (partial: Partial<typeof c>) =>
        patch({ commission: { ...c, ...partial } });

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="commissions"
                description="when enabled, the bar shows above /projects and the pill on home."
                delay={0}
                badge={
                    <Pill tone={c.enabled ? "good" : "muted"}>
                        {c.enabled ? "open" : "closed"}
                    </Pill>
                }
            >
                <Toggle
                    label="taking commissions"
                    hint="turns the animated availability bar on and off."
                    checked={c.enabled}
                    onChange={(enabled) => set({ enabled })}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="label"
                        value={c.label}
                        placeholder="commissions"
                        onChange={(label) => set({ label })}
                    />
                    <TextField
                        label="price"
                        value={c.price}
                        placeholder="$50+"
                        onChange={(price) => set({ price })}
                    />
                    <TextField
                        label="sponsor"
                        value={c.sponsor}
                        placeholder="me"
                        onChange={(sponsor) => set({ sponsor })}
                    />
                    <TextField
                        label="sponsor link"
                        value={c.sponsorUrl}
                        placeholder="/contact"
                        onChange={(sponsorUrl) => set({ sponsorUrl })}
                    />
                    <TextField
                        label="sponsor icon"
                        value={c.sponsorIcon}
                        hint="optional image url"
                        className="sm:col-span-2"
                        placeholder="https://..."
                        onChange={(sponsorIcon) => set({ sponsorIcon })}
                    />
                </div>
                <div className="mt-3">
                    <div className="adm-preview relative overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2.5">
                                <span className="relative inline-flex size-1.5 items-center justify-center">
                                    <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                                    <span className="relative size-1.5 rounded-full bg-white" />
                                </span>
                                <span className="text-xs text-white/85">
                                    taking {c.label || "commissions"}
                                </span>
                                <span className="text-xs text-white/30">·</span>
                                <span className="text-xs text-white/55">
                                    from{" "}
                                    <span className="text-white/85">
                                        {c.price || "$??"}
                                    </span>
                                </span>
                            </span>
                            <span className="text-[10px] text-white/35">
                                {c.sponsor || "sponsor"}
                            </span>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
