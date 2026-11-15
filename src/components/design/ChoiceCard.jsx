import { cn } from "@/lib/utils";

export default function ChoiceCard({ icon: Icon, name, en, desc, stats = [], selected, locked, requiredLevel, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      aria-pressed={selected}
      className={cn(
        "flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-all duration-300",
        locked
          ? "cursor-not-allowed border-white/[0.06] bg-white/[0.012] opacity-45"
          : selected
            ? "border-ion/50 bg-ion/[0.07]"
            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-[13px] text-white">
          {Icon && <Icon className={cn("h-4 w-4 shrink-0", selected ? "text-ion" : "text-white/45")} />}
          <span className="truncate">{name}</span>
        </span>
        {locked ? (
          <span className="shrink-0 font-display text-[10px] text-white/40">Lv.{requiredLevel}</span>
        ) : selected ? (
          <span className="shrink-0 text-[10px] text-ion">選択中</span>
        ) : null}
      </div>
      {en && <p className="mt-1 font-display text-[9px] tracking-[0.22em] text-white/25">{en}</p>}
      <p className="mt-2 text-[11px] leading-relaxed text-dust">{desc}</p>
      {stats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 pt-1 font-display text-[10px] text-white/40">
          {stats.map((stat) => (
            <span key={stat.label}>
              {stat.label} <span className="text-white/75">{stat.value}</span>
            </span>
          ))}
        </div>
      )}
    </button>
  );
}