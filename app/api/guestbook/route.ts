import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
    GUEST_MESSAGE_MAX,
    GUEST_NAME_MAX,
    newGuestEntry,
} from "@/lib/guestbook";
import { getGuestbook, updateGuestbook } from "@/lib/guestbookStore";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const MAX_PER_DAY = 12;

const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for") || "";
    return (
        forwarded.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "local"
    );
}

function rateLimited(ip: string): { limited: boolean; retryAfter: number } {
    const now = Date.now();
    const list = (hits.get(ip) || []).filter((t) => now - t < 24 * 60 * 60 * 1000);
    const inWindow = list.filter((t) => now - t < WINDOW_MS);
    const limited =
        inWindow.length >= MAX_PER_WINDOW || list.length >= MAX_PER_DAY;
    if (!limited) {
        inWindow.push(now);
        hits.set(ip, inWindow);
        if (hits.size > 500) {
            for (const [key, times] of hits) {
                if (!times.some((t) => now - t < 24 * 60 * 60 * 1000))
                    hits.delete(key);
            }
        }
    }
    const oldest = inWindow[0] ?? now;
    return {
        limited,
        retryAfter: Math.max(
            1,
            Math.ceil((oldest + WINDOW_MS - now) / 1000),
        ),
    };
}

function crossSite(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    if (!origin) return false;
    const host =
        req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    try {
        return new URL(origin).host !== host;
    } catch {
        return true;
    }
}

export async function GET() {
    const entries = (await getGuestbook()).filter((e) => e.approved);
    return NextResponse.json(
        { entries },
        { headers: { "Cache-Control": "no-store" } },
    );
}

export async function POST(req: NextRequest) {
    if (crossSite(req)) {
        return NextResponse.json({ error: "bad origin" }, { status: 403 });
    }

    const declared = Number(req.headers.get("content-length") || 0);
    if (declared > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "payload too large" }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
        const raw = await req.text();
        if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
            return NextResponse.json(
                { error: "payload too large" },
                { status: 413 },
            );
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
            throw new Error("bad body");
        body = parsed as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }

    // Bots fill every field they can see; humans leave this one alone.
    if (typeof body.website === "string" && body.website.trim()) {
        return NextResponse.json({ ok: true, pending: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (name.length < 1 || name.length > GUEST_NAME_MAX) {
        return NextResponse.json(
            { error: `a name between 1 and ${GUEST_NAME_MAX} characters` },
            { status: 400 },
        );
    }
    if (message.length < 2 || message.length > GUEST_MESSAGE_MAX) {
        return NextResponse.json(
            {
                error: `a message between 2 and ${GUEST_MESSAGE_MAX} characters`,
            },
            { status: 400 },
        );
    }

    const ip = clientIp(req);
    const limit = rateLimited(ip);
    if (limit.limited) {
        return NextResponse.json(
            { error: "slow down — try again in a few minutes" },
            { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
        );
    }

    const entry = newGuestEntry({
        name,
        message,
        url: typeof body.url === "string" ? body.url : "",
    });

    try {
        await updateGuestbook((entries) => [entry, ...entries].slice(0, 300));
        revalidatePath("/guestbook");
        log("info", "guestbook", "entry submitted", { id: entry.id });
        return NextResponse.json(
            { ok: true, pending: true, entry },
            { status: 201, headers: { "Cache-Control": "no-store" } },
        );
    } catch (e: unknown) {
        const detail = e instanceof Error ? e.message : String(e);
        log("error", "guestbook", "failed to save entry", { error: detail });
        return NextResponse.json(
            { error: "could not save that right now" },
            { status: 500 },
        );
    }
}

