import type { Metadata } from "next";
import { isAuthed, passwordConfigured } from "@/lib/adminAuth";
import { getSite, siteStorageMode, siteStorageWarning } from "@/lib/siteStore";
import { getProjects } from "@/lib/projectsStore";
import { getViews } from "@/lib/viewsStore";
import { getGuestbook } from "@/lib/guestbookStore";
import { log } from "@/lib/logger";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "admin",
    robots: { index: false, follow: false },
};

export default async function AdminPage({
    searchParams,
}: {
    searchParams: { tab?: string };
}) {
    if (!(await isAuthed())) {
        return <AdminLogin configured={passwordConfigured()} />;
    }

    const config = await getSite();
    const storage = siteStorageMode();
    // View stats are a dashboard nicety: an unreachable database must still
    // render the editor (and its banner), not crash the page.
    const [projects, guestbook, views] = await Promise.all([
        getProjects(),
        getGuestbook(),
        getViews().catch((e: unknown) => {
            log("error", "admin", "view stats unavailable", {
                error: e instanceof Error ? e.message : String(e),
            });
            return { total: 0, uniqueDevices: 0 };
        }),
    ]);

    return (
        <AdminShell
            initial={config}
            projects={projects}
            guestbook={guestbook}
            stats={{
                views: views.total,
                uniqueDevices: views.uniqueDevices,
            }}
            storage={storage}
            warning={siteStorageWarning(storage)}
            initialTab={searchParams?.tab}
        />
    );
}
