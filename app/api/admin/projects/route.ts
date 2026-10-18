import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import { getProjects, saveProjects } from "@/lib/projectsStore";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 128 * 1024;

/** Blocks cross-site writes even if a cookie were somehow attached. */
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
    return NextResponse.json(
        { projects: await getProjects() },
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
        const text = await req.text();
        if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
            return NextResponse.json(
                { error: "payload too large" },
                { status: 413 },
            );
        }
        body = JSON.parse(text);
    } catch {
        return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }

    const projectsInput = (body as { projects?: unknown })?.projects;
    if (!Array.isArray(projectsInput)) {
        return NextResponse.json(
            { error: "projects must be an array" },
            { status: 400 },
        );
    }

    try {
        const projects = await saveProjects(projectsInput);
        revalidatePath("/projects");
        log("info", "admin", "projects saved", { count: projects.length });
        return NextResponse.json(
            { projects },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (e: unknown) {
        log("error", "admin", "failed to save projects", {
            error: e instanceof Error ? e.message : String(e),
        });
        return NextResponse.json(
            { error: "could not write projects.json" },
            { status: 500 },
        );
    }
}
