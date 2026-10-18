import type { Metadata } from "next";
import { site } from "@/lib/site";
import { proxiedImage, type Project } from "@/lib/projects";
import { getProjects } from "@/lib/projectsStore";
import CommissionBar from "@/components/CommissionBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `projects — ${site.name}` };

const Arrow = ({
    size = 14,
    className = "",
}: {
    size?: number;
    className?: string;
}) => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        className={className}
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z" />
    </svg>
);

function Icon({ project, px }: { project: Project; px: number }) {
    const icon = proxiedImage(project.icon);
    if (!icon) {
        return (
            <span
                className="grid shrink-0 place-items-center rounded bg-white/[0.08] font-semibold uppercase text-white/70"
                style={{ width: px, height: px, fontSize: Math.round(px * 0.5) }}
            >
                {project.name.slice(0, 1)}
            </span>
        );
    }
    return (
        <img
            alt={`${project.name} icon`}
            width={px}
            height={px}
            className="shrink-0 object-contain"
            src={icon}
        />
    );
}

function FeaturedCard({ project }: { project: Project }) {
    const shot = proxiedImage(project.shot);

    const card = (
        <article
            style={{
                borderColor: "rgba(255,255,255,0.06)",
                boxShadow:
                    "0px 32px 64px -16px rgba(0,0,0,0.30), 0px 16px 32px -8px rgba(0,0,0,0.30), 0px 8px 16px -4px rgba(0,0,0,0.24), 0px 4px 8px -2px rgba(0,0,0,0.24), 0px 2px 4px -1px rgba(0,0,0,0.24), inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
            className="relative isolate flex flex-col overflow-hidden rounded-lg border bg-cardColor/20 backdrop-blur-md transition-[border-color,box-shadow] duration-700 ease-out"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-px left-[10%] right-[10%] z-30 h-px"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, transparent, rgba(255,255,255,0.22), transparent)",
                }}
            />
            <div className="relative aspect-video w-full overflow-hidden bg-white/[0.04]">
                {shot ? (
                    <img
                        alt={`${project.name} screenshot`}
                        className="object-cover absolute inset-0 h-full w-full"
                        src={shot}
                    />
                ) : (
                    <span className="absolute inset-0 grid place-items-center text-5xl font-bold uppercase tracking-tight text-white/15">
                        {project.name.slice(0, 1)}
                    </span>
                )}
            </div>
            <div className="relative px-4 pb-4">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    {shot && (
                        <div
                            className="absolute inset-0 scale-[1.18]"
                            style={{
                                backgroundImage: `url(${shot})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "blur(40px) saturate(1.2)",
                                opacity: 0.65,
                            }}
                        />
                    )}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.44) 100%)",
                        }}
                    />
                </div>
                <div className="relative z-10 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5">
                            <Icon project={project} px={20} />
                        </span>
                        <h2 className="text-lg font-medium tracking-tight text-white/95">
                            {project.name}
                        </h2>
                        {project.year && (
                            <span className="text-[10px] font-light tabular-nums tracking-wider text-white/55">
                                {project.year}
                            </span>
                        )}
                    </div>
                    {project.description && (
                        <p className="mt-2 text-sm leading-relaxed text-white/80">
                            {project.description}
                        </p>
                    )}
                    {project.url && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-white/55 transition-colors duration-300 group-hover:text-white/85">
                            <span>{project.cta}</span>
                            <Arrow className="opacity-60" />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );

    if (!project.url) return card;
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            href={project.url}
        >
            {card}
        </a>
    );
}

function ProjectRow({ project }: { project: Project }) {
    const icon = proxiedImage(project.icon);
    const backdrop = icon || proxiedImage(project.shot);

    const row = (
        <article className="relative isolate overflow-hidden rounded-lg border border-white/[0.05] bg-cardColor/20 backdrop-blur-md shadow-[0px_24px_48px_-16px_#00000059,0px_12px_24px_-8px_#0000004c,0px_6px_12px_-4px_#0000003d,0px_3px_6px_-2px_#0000002e,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff26] transition-[border-color,box-shadow] duration-500 ease-out group-hover:border-white/[0.1]">
            {backdrop && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out group-hover:opacity-[0.55]"
                    style={{
                        backgroundImage: `url(${backdrop})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(20px) saturate(0.85)",
                        opacity: 0.4,
                    }}
                />
            )}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/35"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-px left-[8%] right-[8%] z-20 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
            <div className="relative z-10 flex items-center gap-3 p-3">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/[0.08] shadow-[0px_8px_16px_-4px_rgba(0,0,0,0.5)]">
                    {icon ? (
                        <img
                            alt={`${project.name} icon`}
                            className="object-cover absolute inset-0 h-full w-full"
                            src={icon}
                        />
                    ) : (
                        <span className="text-sm font-semibold uppercase text-white/60">
                            {project.name.slice(0, 1)}
                        </span>
                    )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline gap-2">
                        <h3 className="truncate text-sm font-medium tracking-tight text-white/95">
                            {project.name}
                        </h3>
                        {project.year && (
                            <span className="shrink-0 text-[10px] font-light tabular-nums tracking-wider text-white/55">
                                {project.year}
                            </span>
                        )}
                    </div>
                    {project.description && (
                        <p className="mt-0.5 truncate text-xs leading-relaxed text-white/75">
                            {project.description}
                        </p>
                    )}
                </div>
                <Arrow className="shrink-0 text-white/35 transition-[color,transform] duration-300 ease-out group-hover:translate-x-0.5 group-hover:text-white/80" />
            </div>
        </article>
    );

    if (!project.url) return row;
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            href={project.url}
        >
            {row}
        </a>
    );
}

export default async function ProjectsPage() {
    const projects = await getProjects();
    const featured = projects.filter((p) => p.featured);
    const rest = projects.filter((p) => !p.featured);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center p-4 pb-20 sm:p-24">
            <main className="flex w-full max-w-[680px] flex-col gap-8">
                {site.commission.enabled && <CommissionBar />}

                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-[1px] w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                my work
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            projects
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-[85%]">
                        what i've been building lately.
                    </p>
                </div>

                {projects.length === 0 && (
                    <p className="rounded-lg border border-white/[0.06] bg-cardColor/20 px-4 py-6 text-center text-sm text-white/50">
                        nothing here yet.
                    </p>
                )}

                {featured.length > 0 && (
                    <div className="flex w-full flex-col gap-6">
                        {featured.map((p) => (
                            <FeaturedCard key={p.id} project={p} />
                        ))}
                    </div>
                )}

                {rest.length > 0 && (
                    <section className="flex w-full flex-col gap-3">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-px w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                more projects
                            </span>
                        </div>
                        <ul className="flex w-full flex-col gap-2.5">
                            {rest.map((p) => (
                                <li key={p.id}>
                                    <ProjectRow project={p} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    );
}
