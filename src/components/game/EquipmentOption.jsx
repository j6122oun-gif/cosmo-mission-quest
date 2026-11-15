import { equipmentIcon } from "@/components/game/icons";
import { cn } from "@/lib/utils";

export default function EquipmentOption({ item, selected, locked, onToggle }) {
  const Icon = equipmentIcon(item.id);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={locked}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-all duration-300",
        locked
          ? "cursor-not-allowed border-white/[0.06] bg-white/[0.012] opacity-45"
          : selected
            ? "border-ion/50 bg-ion/[0.07]"
            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"
          style={{ color: item.accent }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm text-white">{item.name}</p>
            {locked ? (
              <span className="shrink-0 font-display text-[10px] text-white/40">Lv.{item.level}</span>
            ) : selected ? (
              <span className="shrink-0 text-[10px] text-ion">搭載</span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-dust">{item.role}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-display text-[10px] text-white/40">
            <span>予算 {item.cost}</span>
            <span>質量 {item.mass}kg</span>
            <span>電力 {item.power}kW</span>
            <span>データ {item.data}GB</span>
          </div>
        </div>
      </div>
    </button>
  );
}