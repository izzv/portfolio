"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newProject, proxiedImage, type Project } from "@/lib/projects";

const INPUT =
    "w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25";

type FieldKey = Exclude<keyof Project, "id" | "featured">;

const FIELDS: {
    key: FieldKey;
    label: string;
    placeholder: string;
    area?: boolean;
    full?: boolean;
}[] = [
    { key: "name", label: "name", placeholder: "grief" },
    { key: "year", label: "year", placeholder: "2026" },
    {
        key: "description",
        label: "description",
        placeholder: "what it is and what it does",
        area: true,
        full: true,
    },
    { key: "url", label: "link", placeholder: "https://grief.pics" },
    { key: "cta", label: "link label", placeholder: "view live site" },
    {
        key: "icon",
        label: "icon url",
        placeholder: "https://grief.pics/icon.png",
    },
    {
        key: "shot",
        label: "screenshot url",
        placeholder: "/media/projects/grief.png",
    },
];

function RowButton({
    children,
    label,
    onClick,
    active = false,
    danger = false,
    disabled = false,
}: {
    children: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
    danger?: boolean;
    disabled?: boolean;
}) {
    const tone = danger
        ? "text-red-300/70 hover:text-red-200 hover:bg-red-400/10"
        : active
          ? "text-white bg-white/[0.14]"
          : "text-white/55 hover:text-white/90 hover:bg-white/[0.07]";
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            disabled={disabled}
            className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${tone}`}
        >
            {children}
        </button>
    );
}

export default function ProjectsAdmin({ initial }: { initial: Project[] }) {
    const router = useRouter();
    const [items, setItems] = useState<Project[]>(initial);
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState<number | null>(null);

    useEffect(() => {
        if (!dirty) return;
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    function touch() {
        setDirty(true);
        setError(null);
        setSavedAt(null);
    }

    function patch(id: string, key: keyof Project, value: string | boolean) {
        setItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
        );
        touch();
    }

    function add() {
        const project = newProject();
        setItems((prev) => [...prev, project]);
        setOpenIds((prev) => [...prev, project.id]);
        touch();
    }

    function remove(id: string) {
        const target = items.find((p) => p.id === id);
        const label = target?.name || "this project";
        if (!window.confirm(`delete ${label}?`)) return;
        setItems((prev) => prev.filter((p) => p.id !== id));
        setOpenIds((prev) => prev.filter((openId) => openId !== id));
        touch();
    }

    function move(index: number, dir: -1 | 1) {
        setItems((prev) => {
            const next = [...prev];
            const target = index + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
        touch();
    }

    function toggleOpen(id: string) {
        setOpenIds((prev) =>
            prev.includes(id)
                ? prev.filter((openId) => openId !== id)
                : [...prev, id],
        );
    }

    async function save() {
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projects: items }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                projects?: Project[];
                error?: string;
            };
            if (!res.ok || !data.projects) {
                throw new Error(data.error || `save failed (${res.status})`);
            }
            setItems(data.projects);
            setDirty(false);
            setSavedAt(Date.now());
            router.refresh();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "save failed");
        } finally {
            setBusy(false);
        }
    }

    async function logout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center p-4 pb-24 sm:p-24">
            <main className="flex w-full max-w-[760px] flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-[1px] w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                admin
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            projects
                        </h1>
                        <p className="text-xs text-white/50">
                            changes go live on{" "}
                            <a
                                href="/projects"
                                className="text-white/75 underline decoration-white/25 underline-offset-2 hover:text-white"
                            >
                                /projects
                            </a>{" "}
                            as soon as you save.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="shrink-0 rounded-md border border-white/[0.08] px-2.5 py-1.5 text-xs text-white/55 transition-colors hover:border-white/[0.18] hover:text-white/85"
                    >
                        log out
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={add}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/80 transition-colors hover:border-white/[0.2] hover:bg-white/[0.07] hover:text-white"
                    >
                        + add project
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={busy || !dirty}
                        className="rounded-md border border-white/[0.14] bg-white/[0.1] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        {busy ? "saving…" : "save changes"}
                    </button>
                    <span className="text-[11px] text-white/45">
                        {items.length} project{items.length === 1 ? "" : "s"}
                        {dirty && " · unsaved changes"}
                        {!dirty && savedAt && " · saved"}
                    </span>
                </div>

                {error && (
                    <p className="rounded-md border border-red-400/25 bg-red-400/[0.07] px-3 py-2 text-xs text-red-200/90">
                        {error}
                    </p>
                )}

                {items.length === 0 && (
                    <p className="rounded-lg border border-white/[0.06] bg-cardColor/20 px-4 py-6 text-center text-sm text-white/50">
                        no projects yet — add one above.
                    </p>
                )}

                <ul className="flex flex-col gap-2.5">
                    {items.map((project, index) => {
                        const open = openIds.includes(project.id);
                        const icon = proxiedImage(project.icon);
                        return (
                            <li
                                key={project.id}
                                className="anim-item relative isolate overflow-hidden rounded-lg border border-white/[0.06] bg-cardColor/20 backdrop-blur-md"
                                style={{ animationDelay: `${index * 45}ms` }}
                            >
                                <div className="flex items-center gap-2.5 p-2.5">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]">
                                        {icon ? (
                                            <img
                                                src={icon}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[11px] font-semibold uppercase text-white/55">
                                                {(project.name || "?").slice(
                                                    0,
                                                    1,
                                                )}
                                            </span>
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate text-sm text-white/90">
                                                {project.name || "untitled"}
                                            </span>
                                            {project.featured && (
                                                <span className="shrink-0 rounded bg-emerald-400/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-200/90">
                                                    featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="truncate text-[11px] text-white/45">
                                            {project.url || "no link"}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <RowButton
                                            label={
                                                project.featured
                                                    ? "unfeature"
                                                    : "make featured"
                                            }
                                            active={project.featured}
                                            onClick={() =>
                                                patch(
                                                    project.id,
                                                    "featured",
                                                    !project.featured,
                                                )
                                            }
                                        >
                                            ★
                                        </RowButton>
                                        <RowButton
                                            label="move up"
                                            disabled={index === 0}
                                            onClick={() => move(index, -1)}
                                        >
                                            ↑
                                        </RowButton>
                                        <RowButton
                                            label="move down"
                                            disabled={index === items.length - 1}
                                            onClick={() => move(index, 1)}
                                        >
                                            ↓
                                        </RowButton>
                                        <RowButton
                                            label={open ? "collapse" : "edit"}
                                            active={open}
                                            onClick={() => toggleOpen(project.id)}
                                        >
                                            {open ? "close" : "edit"}
                                        </RowButton>
                                        <RowButton
                                            label="delete"
                                            danger
                                            onClick={() => remove(project.id)}
                                        >
                                            ✕
                                        </RowButton>
                                    </div>
                                </div>

                                {open && (
                                    <div className="grid gap-2.5 border-t border-white/[0.06] p-3 sm:grid-cols-2">
                                        {FIELDS.map((field) => (
                                            <div
                                                key={field.key}
                                                className={
                                                    field.full
                                                        ? "sm:col-span-2"
                                                        : undefined
                                                }
                                            >
                                                <label
                                                    htmlFor={`${project.id}-${field.key}`}
                                                    className="mb-1 block text-[11px] text-white/50"
                                                >
                                                    {field.label}
                                                </label>
                                                {field.area ? (
                                                    <textarea
                                                        id={`${project.id}-${field.key}`}
                                                        rows={3}
                                                        value={project[field.key]}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        onChange={(e) =>
                                                            patch(
                                                                project.id,
                                                                field.key,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`${INPUT} resize-y`}
                                                    />
                                                ) : (
                                                    <input
                                                        id={`${project.id}-${field.key}`}
                                                        value={project[field.key]}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        onChange={(e) =>
                                                            patch(
                                                                project.id,
                                                                field.key,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={INPUT}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <label className="flex items-center gap-2 text-xs text-white/60 sm:col-span-2">
                                            <input
                                                type="checkbox"
                                                checked={project.featured}
                                                onChange={(e) =>
                                                    patch(
                                                        project.id,
                                                        "featured",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="size-3.5 accent-white"
                                            />
                                            featured — shown as a large card
                                            with its screenshot
                                        </label>
                                        <p className="text-[11px] leading-relaxed text-white/40 sm:col-span-2">
                                            grief.pics icons are blocked from
                                            hotlinking, so they are served
                                            through /api/img automatically.
                                        </p>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </main>
        </div>
    );
}
