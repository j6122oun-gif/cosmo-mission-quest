import { cn } from "@/lib/utils";

const fmt = (value) => (Number.isInteger(Number(value)) ? Number(value) : Number(value).toFixed(1));

export default function MarginMeter({ label, used, limit, unit, ok = true, pct = 0, margin = 0, warn = false }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-dust">{label}</span>
        <span className={cn("font-display", !ok ? "text-rose-300" : warn ? "text-solar" : "text-white/80")}>
          {fmt(used)}
          <span className="ml-1 text-white/30">
            / {fmt(limit)} {unit}
          </span>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            !ok ? "bg-rose-400" : warn ? "bg-solar" : "bg-gradient-to-r from-ion to-nebula",
          )}
          style={{ width: `${Math.min(100, Math.max(used > 0 ? 2 : 0, pct))}%` }}
        />
      </div>
      <p className={cn("mt-1 text-[10px]", !ok ? "text-rose-300" : "text-white/35")}>
        {ok ? `余裕 ${fmt(margin)} ${unit}` : `${fmt(Math.abs(margin))} ${unit} 超過`}
      </p>
    </div>
  );
}