"use client";

import { useEffect, useState } from "react";
import { useExperience } from "./ExperienceProvider";

/**
 * The album art of the track on the now-playing widget, blown up and blurred
 * into the page background.
 *
 * Two layers are kept so a track change crossfades instead of flashing; the
 * image is fetched through /api/img because Last.fm's CDN sends
 * Cross-Origin-Resource-Policy: same-origin. With no track the component
 * renders nothing and the blossom scene stays exactly as it was.
 */

const proxied = (url: string) =>
    url.startsWith("/") || url.startsWith("data:")
        ? url
        : `/api/img?url=${encodeURIComponent(url)}`;

export default function CoverBackdrop() {
    const { now } = useExperience();
    const src = now?.image ? proxied(now.image) : "";
    const [layers, setLayers] = useState<string[]>([]);

    useEffect(() => {
        if (!src) return;
        setLayers((prev) =>
            prev[prev.length - 1] === src ? prev : [...prev, src].slice(-2),
        );
    }, [src]);

    if (!layers.length) return null;

    return (
        <div className="cover-backdrop" aria-hidden="true">
            {layers.map((url, i) => (
                <span
                    key={url}
                    className={
                        i === layers.length - 1
                            ? "cover-layer is-new"
                            : "cover-layer"
                    }
                    style={{
                        backgroundImage: `url(${JSON.stringify(url)})`,
                    }}
                />
            ))}
            <span className="cover-scrim" />
        </div>
    );
}
