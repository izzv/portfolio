export default function Background() {
    const bg = `radial-gradient(
        200% 200% at 50% -20%,
        rgba(32,32,35,0.12) 0%,
        rgba(32,32,35,0.08399999999999999) 20%,
        rgba(32,32,35,0.036) 40%,
        rgba(0,0,0,0) 60%
      ),
      radial-gradient(
        180% 180% at 15% 50%,
        rgba(28,28,30,0.08) 0%,
        rgba(28,28,30,0.048) 30%,
        rgba(28,28,30,0.016) 50%,
        rgba(0,0,0,0) 70%
      ),
      radial-gradient(
        160% 160% at 85% 50%,
        rgba(35,35,40,0.05) 0%,
        rgba(35,35,40,0.034999999999999996) 25%,
        rgba(35,35,40,0.015) 45%,
        rgba(0,0,0,0) 65%
      )`;
    return (
        <>
            <div
                className="fixed inset-0 pointer-events-none -z-10"
                style={{ background: bg, opacity: 1 }}
            />
            <div className="fixed inset-0 pointer-events-none -z-[9] overflow-hidden" />
        </>
    );
}
