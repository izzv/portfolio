import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import {
    getSite,
    saveSite,
    siteStorageMode,
    siteStorageWarning,
} from "@/lib/siteStore";
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
    const config = await getSite();
    const storage = siteStorageMode();
    return NextResponse.json(
        { config, storage, warning: siteStorageWarning(storage) },
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

    const configInput = (body as { config?: unknown })?.config ?? body;
    if (!configInput || typeof configInput !== "object") {
        return NextResponse.json({ error: "config must be an object" }, { status: 400 });
    }

    try {
        const config = await saveSite(configInput);
        revalidatePath("/", "layout");
        log("info", "admin", "site config saved", {
            storage: siteStorageMode(),
        });
        const storage = siteStorageMode();
        return NextResponse.json(
            { config, storage, warning: siteStorageWarning(storage) },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (e: unknown) {
        const detail = e instanceof Error ? e.message : String(e);
        log("error", "admin", "failed to save site config", { error: detail });
        return NextResponse.json(
            {
                error: "could not write site.json",
                detail,
                storage: siteStorageMode(),
            },
            { status: 500 },
        );
    }
}
