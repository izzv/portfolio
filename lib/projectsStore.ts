import { promises as fs } from "fs";
import path from "path";
import {
    DEFAULT_PROJECTS,
    normalizeProjects,
    type Project,
} from "./projects";

const FILE = path.join(process.cwd(), "projects.json");

function defaults(): Project[] {
    return DEFAULT_PROJECTS.map((p) => ({ ...p }));
}

export async function getProjects(): Promise<Project[]> {
    try {
        const raw = await fs.readFile(FILE, "utf8");
        return normalizeProjects(JSON.parse(raw));
    } catch {
        return defaults();
    }
}

export async function saveProjects(input: unknown): Promise<Project[]> {
    const projects = normalizeProjects(input);
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(projects, null, 4)}\n`, "utf8");
    await fs.rename(tmp, FILE);
    return projects;
}

export { FILE as PROJECTS_FILE };
