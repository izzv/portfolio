/**
 * One block of the single scrolling page. Every section owns a viewport so
 * scrolling moves through the site, while the top rail stays fixed above it.
 */
export default function Section({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} data-section className="site-section">
            <div className="site-section-inner">{children}</div>
        </section>
    );
}
