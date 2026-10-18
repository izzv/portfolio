import type { Metadata } from "next";
import { site } from "@/lib/site";
import { isAuthed, passwordConfigured } from "@/lib/adminAuth";
import { getProjects } from "@/lib/projectsStore";
import AdminLogin from "@/components/admin/AdminLogin";
import ProjectsAdmin from "@/components/admin/ProjectsAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: `admin — ${site.name}`,
    robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
    if (!(await isAuthed())) {
        return <AdminLogin configured={passwordConfigured()} />;
    }

    return <ProjectsAdmin initial={await getProjects()} />;
}
