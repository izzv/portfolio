import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import {
    getGuestbook,
    guestbookMode,
    guestbookWarning,
    saveGuestbook,
} from "@/lib/guestbookStore";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;

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

async function guard() {
    if (await isAuthed()) return null;
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET() {
    const denied = await guard();
    if (denied) return denied;
    const entries = await getGuestbook();
    const mode = guestbookMode();
    return NextResponse.json(
        { entries, storage: mode, warning: guestbookWarning(mode) },
        { headers: { "Cache-Control": "no-store" } },
    );
}

export async function PUT(req: NextRequest) {
    const denied = await guard();
    if (denied) return denied;

    if (crossSite(req)) {
        return NextResponse.json({ error: "bad origin" }, { status: 403 });
    }

    const declared = Number(req.headers.get("content-length") || 0);
    if (declared > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "payload too large" }, { status: 413 });
    }

    let body: unknown;
    try {
        const raw = await req.text();
        if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
            return NextResponse.json(
                { error: "payload too large" },
                { status: 413 },
            );
        }
        body = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }

    const entriesInput = (body as { entries?: unknown })?.entries;
    if (!Array.isArray(entriesInput)) {
        return NextResponse.json(
            { error: "entries must be an array" },
            { status: 400 },
        );
    }

    try {
        const entries = await saveGuestbook(entriesInput);
        revalidatePath("/guestbook");
        log("info", "admin", "guestbook saved", {
            count: entries.length,
            mode: guestbookMode(),
        });
        const mode = guestbookMode();
        return NextResponse.json(
            { entries, storage: mode, warning: guestbookWarning(mode) },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (e: unknown) {
        const detail = e instanceof Error ? e.message : String(e);
        log("error", "admin", "failed to save guestbook", { error: detail });
        return NextResponse.json(
            { error: "could not save the guestbook to MongoDB", detail },
            { status: 500 },
        );
    }
}
