import { Check, Lock } from "lucide-react";
import { equipmentIcon } from "@/components/game/icons";
import { cn } from "@/lib/utils";

export default function SurveyCard({ target, equipment, state, reason, onScan }) {
  const Icon = equipmentIcon(equipment.id);
  const found = state === "found";
  const scanning = state === "scanning";
  const ready = state === "ready";
  const blocked = state === "blocked";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-500",
        found
          ? "border-emerald-400/25 bg-emerald-400/[0.05]"
          : ready
            ? "border-white/12 bg-white/[0.035]"
            : "border-white/[0.06] bg-white/[0.015]",
      )}
    >
      {scanning && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-24 animate-scan-sweep bg-gradient-to-b from-transparent via-ion/25 to-transparent" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[10px] tracking-[0.24em] text-white/35">{target.site}</p>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
            found
              ? "bg-emerald-400/15 text-emerald-300"
              : ready
                ? "bg-ion/10 text-ion"
                : blocked
                  ? "bg-rose-400/10 text-rose-300"
                  : "bg-white/[0.05] text-white/35",
          )}
        >
          {found ? <Check className="h-3 w-3" /> : !ready ? <Lock className="h-3 w-3" /> : null}
          {found ? "調査済み" : ready ? "調査可能" : blocked ? "達成不可" : "装備なし"}
        </span>
      </div>

      {found ? (
        <div className="mt-3">
          <h3 className="font-heading text-base font-medium text-white">{target.title}</h3>
          <p className="mt-2 text-[12px] leading-[1.85] text-white/60">{target.body}</p>
          <p className="mt-3 font-display text-[11px] text-emerald-300">+{target.points} pt</p>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: equipment.accent }} />
            <p className="text-[12px] text-white/70">{equipment.name}</p>
          </div>
          <p className={cn("mt-2 text-[11px] leading-relaxed", blocked ? "text-rose-300/90" : "text-dust")}>
            {blocked && reason
              ? reason
              : ready
                ? `${equipment.role}ための観測を開始します。`
                : "この装備を積んでいないため、調査できません。"}
          </p>
          <button
            type="button"
            onClick={onScan}
            disabled={!ready || scanning}
            className={cn(
              "mt-4 w-full rounded-full px-4 py-2.5 text-xs transition-all duration-300",
              ready && !scanning
                ? "bg-white/10 text-white hover:bg-ion hover:text-[#04121a]"
                : "cursor-not-allowed bg-white/[0.06] text-white/30",
            )}
          >
            {scanning ? "観測中…" : ready ? "調査する" : blocked ? "この目標は達成できません" : "装備が必要"}
          </button>
        </div>
      )}
    </div>
  );
}