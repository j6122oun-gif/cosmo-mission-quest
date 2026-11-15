import { Check } from "lucide-react";
import { equipmentIcon } from "@/components/game/icons";
import { ORBIT_NAMES } from "@/lib/missionDesign";
import { cn } from "@/lib/utils";

export default function ObjectiveRow({ target, tool, selected, disabled, toolLocked, reason, onToggle }) {
  const Icon = equipmentIcon(target.equipment);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-all duration-300",
        selected
          ? "border-ion/40 bg-ion/[0.06]"
          : disabled
            ? "cursor-not-allowed border-white/[0.06] bg-white/[0.012] opacity-45"
            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-colors",
            selected ? "border-ion bg-ion/20" : "border-white/25",
          )}
        >
          {selected && <Check className="h-3 w-3 text-ion" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] text-white">{target.site}</p>
            <span className="shrink-0 font-display text-[10px] text-ion/80">+{target.points} pt</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/45">
            <span className="flex items-center gap-1">
              <Icon className="h-3 w-3" style={{ color: tool.accent }} />
              {tool.name}
            </span>
            <span>軌道 {ORBIT_NAMES[tool.minOrbit]}</span>
            <span>データ {tool.data} GB</span>
            {toolLocked && <span className="text-solar">機器は Lv.{tool.level} で解放</span>}
          </div>
          {selected && (
            <p className={cn("mt-1.5 text-[10px] leading-relaxed", reason ? "text-rose-300" : "text-emerald-300")}>
              {reason ? `達成できません：${reason}` : "達成できる見込み"}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}