import { cn } from "@/lib/utils";

const STARS = Array.from({ length: 110 }, (_, i) => {
  const rnd = (n) => {
    const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    top: Number((rnd(1) * 100).toFixed(3)),
    left: Number((rnd(2) * 100).toFixed(3)),
    size: Number((0.7 + rnd(3) * 1.8).toFixed(2)),
    delay: Number((rnd(4) * 6).toFixed(2)),
    opacity: Number((0.2 + rnd(5) * 0.65).toFixed(2)),
  };
});

export default function StarField({ absolute = false, className }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none inset-0 overflow-hidden",
        absolute ? "absolute" : "fixed",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(99,230,255,0.10),transparent_45%),radial-gradient(circle_at_82%_4%,rgba(167,139,250,0.13),transparent_42%),radial-gradient(circle_at_50%_105%,rgba(255,184,107,0.07),transparent_55%)]" />
      {STARS.map((star, index) => (
        <span
          key={index}
          className="absolute animate-twinkle rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}