type Level = "info" | "warn" | "error";

const COLORS: Record<Level, string> = {
    info: "\u001b[36m",
    warn: "\u001b[33m",
    error: "\u001b[31m",
};
const RESET = "\u001b[0m";

export function log(
    level: Level,
    scope: string,
    message: string,
    data?: Record<string, unknown>,
): void {
    const ts = new Date().toISOString();
    const head = `${COLORS[level]}[${ts}] [${level.toUpperCase()}] [${scope}]${RESET} ${message}`;
    const sink =
        level === "error"
            ? console.error
            : level === "warn"
              ? console.warn
              : console.log;
    if (data && Object.keys(data).length) sink(head, JSON.stringify(data));
    else sink(head);
}
