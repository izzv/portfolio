export type GuestEntry = {
    id: string;
    name: string;
    message: string;
    url: string;
    createdAt: number;
    /** false until the owner approves it in /admin */
    approved: boolean;
};

const MAX_ENTRIES = 300;

export const GUEST_NAME_MAX = 32;
export const GUEST_MESSAGE_MAX = 500;

function str(value: unknown, max: number): string {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function link(value: unknown): string {
    const raw = str(value, 2048);
    if (!raw) return "";
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw)
        ? raw
        : `https://${raw}`;
    try {
        const u = new URL(candidate);
        if (u.protocol === "https:" || u.protocol === "http:")
            return u.toString();
    } catch {}
    return "";
}

function id(value: unknown): string {
    const raw = str(value, 40).replace(/[^a-zA-Z0-9-]/g, "");
    return raw || Math.random().toString(36).slice(2, 10);
}

function when(value: unknown): number {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return Math.min(n, Date.now() + 1000);
    return Date.now();
}

/**
 * Entries are user content: keep only what the page renders, cap every field,
 * and drop rows that would render as an empty card.
 */
export function normalizeGuestbook(input: unknown): GuestEntry[] {
    if (!Array.isArray(input)) return [];
    const seen = new Set<string>();
    const out: GuestEntry[] = [];

    for (const raw of input.slice(0, MAX_ENTRIES)) {
        if (!raw || typeof raw !== "object") continue;
        const r = raw as Record<string, unknown>;
        const message = str(r.message, GUEST_MESSAGE_MAX);
        const name = str(r.name, GUEST_NAME_MAX);
        if (!message || !name) continue;
        let entryId = id(r.id);
        while (seen.has(entryId)) entryId = id("");
        seen.add(entryId);
        out.push({
            id: entryId,
            name,
            message,
            url: link(r.url),
            createdAt: when(r.createdAt),
            approved: r.approved === true,
        });
    }
    return out;
}

export function newGuestEntry(input: {
    name: string;
    message: string;
    url?: string;
}): GuestEntry {
    return {
        id: Math.random().toString(36).slice(2, 10),
        name: str(input.name, GUEST_NAME_MAX),
        message: str(input.message, GUEST_MESSAGE_MAX),
        url: link(input.url),
        createdAt: Date.now(),
        approved: false,
    };
}

export function approvedEntries(entries: GuestEntry[]): GuestEntry[] {
    return entries.filter((e) => e.approved);
}
