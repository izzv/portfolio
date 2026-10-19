import { redirect } from "next/navigation";

/**
 * The site is one scrolling page now; old deep links keep working by landing
 * on the matching section.
 */
export default function ProjectsPage() {
    redirect("/#projects");
}
