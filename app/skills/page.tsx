import type { Metadata } from "next";
import * as Si from "react-icons/si";
import { getSite } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const site = await getSite();
    return {
        title: `skills — ${site.name}`,
        alternates: { canonical: "/skills" },
    };
}

const ICON_NAME: Record<string, string> = {
    TypeScript: "SiTypescript",
    JavaScript: "SiJavascript",
    Python: "SiPython",
    "Next.js": "SiNextdotjs",
    React: "SiReact",
    TailwindCSS: "SiTailwindcss",
    "Node.js": "SiNodedotjs",
    FastAPI: "SiFastapi",
    Vite: "SiVite",
    Astro: "SiAstro",
    Webpack: "SiWebpack",
    Bun: "SiBun",
    Git: "SiGit",
    GitHub: "SiGithub",
    Docker: "SiDocker",
    Vercel: "SiVercel",
    PostgreSQL: "SiPostgresql",
    AWS: "SiAmazonwebservices",
    Cloudflare: "SiCloudflare",
    Redis: "SiRedis",
    Kubernetes: "SiKubernetes",
    Zsh: "SiZsh",
};

const VSCODE_PATH =
    "m21.29 4.1-4.12-2a1.36 1.36 0 0 0-.48-.1h-.08a1.18 1.18 0 0 0-.72.24l-.14.12-7.88 7.19L4.44 7a.83.83 0 0 0-.54-.17.88.88 0 0 0-.53.17l-1.1 1a.8.8 0 0 0-.27.61.84.84 0 0 0 .27.62l3 2.71-3 2.72a.84.84 0 0 0 0 1.23l1.1 1a.89.89 0 0 0 .6.22.93.93 0 0 0 .47-.17l3.43-2.61 7.88 7.19a1.2 1.2 0 0 0 .76.36h.17a1 1 0 0 0 .49-.12l4.12-2a1.25 1.25 0 0 0 .71-1.1V5.23a1.26 1.26 0 0 0-.71-1.13zM17 16.47l-6-4.53 6-4.53z";

const CLOUD_PATH =
    "M0 336c0 79.5 64.5 144 144 144l368 0c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32C167.6 32 96 103.6 96 192c0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336z";

const PILL =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all duration-150 [&_svg]:size-3.5 [&_svg]:shrink-0 bg-cardColor hover:bg-cardColorForeground py-2 h-6 px-2.5 text-xs hover:text-brand cursor-default text-[#adadad] shadow-[0px_32px_64px_-16px_#0000004c,0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_-8px_16px_-1px_#00000029,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] hover:shadow-[0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33] hover:translate-y-[0.5px]";

function SkillPill({ name }: { name: string }) {
    const Icon = ICON_NAME[name]
        ? ((Si as Record<string, any>)[ICON_NAME[name]] as
              | React.ComponentType
              | undefined)
        : undefined;
    return (
        <div className={PILL}>
            {name === "VSCode" ? (
                <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d={VSCODE_PATH} />
                </svg>
            ) : name === "AWS" ? (
                <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 640 512"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d={CLOUD_PATH} />
                </svg>
            ) : Icon ? (
                <Icon />
            ) : null}
            <span>{name}</span>
        </div>
    );
}

export default async function SkillsPage() {
    const site = await getSite();
    return (
        <div className="grid grid-rows-[1fr] items-start justify-items-center min-h-[100dvh] p-4 pb-20 sm:p-24">
            <main className="flex flex-col gap-8 items-start max-w-[680px] w-full">
                <div className="anim-item space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-[1px] w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                my tech stack
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            skills
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-[85%]">
                        languages, frameworks and tools i actually reach for —
                        from next.js apps to the cli and infra behind them.
                    </p>
                </div>
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(site.skills).map(([section, items], i) => (
                        <section
                            key={section}
                            className="anim-item"
                            style={{ animationDelay: `${80 + i * 90}ms` }}
                        >
                            <h3 className="text-white/75 text-sm mb-4 flex items-center gap-2">
                                <span>{section}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {(items as string[]).map((name) => (
                                    <SkillPill key={name} name={name} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
