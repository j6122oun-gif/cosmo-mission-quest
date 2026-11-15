import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-12 w-12",
  sm: "h-24 w-24",
  md: "h-32 w-32 sm:h-40 sm:w-40",
  lg: "h-48 w-48 sm:h-60 sm:w-60",
};

export default function PlanetVisual({ planet, size = "md", ring = false, className }) {
  const { colors } = planet;
  return (
    <div className={cn("relative shrink-0", SIZES[size], className)}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 26%, ${colors.light} 0%, ${colors.base} 44%, ${colors.shade} 100%)`,
          boxShadow: `inset -14px -18px 55px rgba(0,0,0,0.75), 0 0 70px -10px ${colors.glow}66`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 62% 38%, rgba(255,255,255,0.18), transparent 58%), radial-gradient(circle at 20% 70%, rgba(0,0,0,0.35), transparent 60%)",
        }}
      />
      {ring && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-16deg] rounded-[50%] border"
          style={{
            width: "172%",
            height: "46%",
            borderColor: `${colors.glow}55`,
            boxShadow: `0 0 24px ${colors.glow}22`,
          }}
        />
      )}
    </div>
  );
}