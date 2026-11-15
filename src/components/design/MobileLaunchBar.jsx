import { VERDICT } from "@/lib/missionSim";
import { cn } from "@/lib/utils";

export default function MobileLaunchBar({ sim, locked, disabled, onLaunch }) {
  const verdict = VERDICT[sim.verdict];

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-void/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-[9px] tracking-[0.24em]", verdict.tone)}>{verdict.label}</p>
          <p className="truncate text-[11px] text-white/55">
            目標 {sim.feasibleCount} / {sim.objectives.length} ・ 予算 {sim.budget.used} / {sim.budget.limit} 億円
          </p>
        </div>
        <button
          type="button"
          onClick={onLaunch}
          disabled={locked || disabled}
          className={cn(
            "shrink-0 rounded-full px-5 py-2.5 text-[12px] transition-colors",
            !locked && !disabled ? "bg-ion text-[#04121a]" : "cursor-not-allowed bg-white/10 text-white/35",
          )}
        >
          {locked ? "要レベル" : "打ち上げ"}
        </button>
      </div>
    </div>
  );
}