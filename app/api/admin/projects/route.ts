import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import { getProjects, saveProjects } from "@/lib/projectsStore";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

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

    let body: unknown;
    try {
        body = await req.json();
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
