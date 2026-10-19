"use client";

import { useEffect, useState } from "react";
import { useExperience } from "./ExperienceProvider";

/**
 * The album art of the track that is playing right now, blown up and blurred
 * into the page background.
 *
 * This is a playback effect, not a permanent layer: it exists while a track is
 * playing and disappears again when playback stops, leaving the default blossom
 * scene. A paused track counts as stopped, so the site falls back to the default
 * background instead of freezing on the last cover.
 *
 * Two layers are kept so a track change crossfades instead of flashing; the
 * image is fetched through /api/img because Last.fm's CDN sends
 * Cross-Origin-Resource-Policy: same-origin.
 */

const proxied = (url: string) =>
    url.startsWith("/") || url.startsWith("data:")
        ? url
        : `/api/img?url=${encodeURIComponent(url)}`;

export default function CoverBackdrop() {
    const { now } = useExperience();
    const playing = !!now?.isPlaying && !!now?.image;
    const src = playing ? proxied(now!.image) : "";
    const [layers, setLayers] = useState<string[]>([]);

    useEffect(() => {
        if (!src) return;
        setLayers((prev) =>
            prev[prev.length - 1] === src ? prev : [...prev, src].slice(-2),
        );
    }, [src]);

    // Gated on `src`, not on the kept layers: the moment playback stops this
    // returns null and the default background is what the visitor sees.
    if (!src || !layers.length) return null;

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
