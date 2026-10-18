/**
 * Last.fm reports *what* is playing, never *how far into it* you are. Spotify's
 * currently-playing endpoint does return `progress_ms`, but only when owner
 * credentials are configured. So the lyrics need a clock either way:
 *
 * - Spotify present  -> the real position, straight from `progress_ms`.
 * - Last.fm only     -> an estimate anchored on the first poll that saw the
 *                       track playing; every later poll keeps counting from
 *                       that anchor, so the value advances even when nobody is
 *                       on the site (the server process keeps the anchor).
 *
 * The estimate is re-armed when the track changes, when playback stops, or once
 * it is older than any plausible song. It cannot know about seeks or a track
 * that started before the server first saw it.
 */

type Anchor = { key: string; startedAt: number; seenAt: number };

const MAX_TRACK_MS = 20 * 60_000;

let anchor: Anchor | null = null;

export type PlaybackPosition = {
    progressMs: number;
    at: number;
    estimated: boolean;
};

export function observePlayback(
    key: string,
    playing: boolean,
): PlaybackPosition | null {
    const now = Date.now();
    if (!playing) {
        anchor = null;
        return null;
    }
    if (
        !anchor ||
        anchor.key !== key ||
        now - anchor.startedAt > MAX_TRACK_MS
    ) {
        anchor = { key, startedAt: now, seenAt: now };
    } else {
        anchor.seenAt = now;
    }
    return {
        progressMs: Math.max(0, now - anchor.startedAt),
        at: now,
        estimated: true,
    };
}

/** Test/seed hook: pin the clock for a known start time. */
export function resetPlaybackClock(): void {
    anchor = null;
}
