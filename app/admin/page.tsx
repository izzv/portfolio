import type { Metadata } from "next";
import { isAuthed, passwordConfigured } from "@/lib/adminAuth";
import { getSite, siteStorageMode, siteStorageWarning } from "@/lib/siteStore";
import { getProjects } from "@/lib/projectsStore";
import { getViews } from "@/lib/viewsStore";
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
    const [projects, views] = await Promise.all([getProjects(), getViews()]);

    return (
        <AdminShell
            initial={config}
            projects={projects}
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
