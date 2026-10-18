"use client";

import { useExperience } from "./ExperienceProvider";

export default function DiscordAvatar({
    size = 42,
    ring = "rgba(255,255,255,0.15)",
}: {
    size?: number;
    ring?: string;
}) {
    const { avatarUrl } = useExperience();
    return (
        <span
            className="relative shrink-0 overflow-hidden rounded-full"
            style={{
                display: "block",
                width: size,
                height: size,
                boxShadow: `inset 0 0 0 1px ${ring}`,
            }}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt=""
                    style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <span
                    style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        background: "rgba(255,255,255,0.08)",
                    }}
                />
            )}
        </span>
    );
}
