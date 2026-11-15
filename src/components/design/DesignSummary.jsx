import { ArrowRight } from "lucide-react";
import MarginMeter from "@/components/design/MarginMeter";
import { VERDICT } from "@/lib/missionSim";
import { cn } from "@/lib/utils";

const fmt = (value) => (Number.isInteger(Number(value)) ? Number(value) : Number(value).toFixed(1));

export default function DesignSummary({ planet, sim, locked, disabled, onLaunch }) {
  const verdict = VERDICT[sim.verdict];
  const canLaunch = !locked && !disabled;
  const empty = sim.objectives.length === 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[10px] tracking-[0.3em] text-white/35">MISSION SIMULATION</p>
        <span className="font-display text-[10px] tracking-[0.18em] text-white/25">Lv.{planet.requiredLevel}〜</span>
      </div>

      <div className={cn("mt-4 rounded-2xl border p-4", verdict.border, verdict.bg)}>
        <p className={cn("font-display text-[10px] tracking-[0.28em]", verdict.tone)}>{verdict.label}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/85">
          {empty ? "探査目的を選ぶと、達成の見込みを試算します。" : verdict.title}
        </p>
        <p className="mt-2 text-[11px] text-dust">
          達成できる目標{" "}
          <span className="text-white/80">
            {sim.feasibleCount} / {sim.objectives.length}
          </span>
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <MarginMeter label="予算" {...sim.budget} warn={sim.budget.ok && sim.budget.marginPct < 6} />
        <MarginMeter label="打ち上げ質量" {...sim.mass} warn={sim.mass.ok && sim.mass.marginPct < 8} />
        <MarginMeter label="電力" {...sim.power} warn={sim.power.ok && sim.power.marginPct < 10} />
        <MarginMeter label="通信帯域" {...sim.data} warn={sim.data.ok && sim.data.marginPct < 8} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-void/60 px-3 py-2 text-[11px]">
        <span className="text-dust">軌道適合</span>
        <span className={sim.orbit.reachable ? "text-white/85" : "text-rose-300"}>
          {sim.names.launcher} → {sim.names.orbit}
        </span>
      </div>

      {sim.issues.length > 0 && (
        <ul className="mt-4 space-y-2">
          {sim.issues.map((issue, index) => (
            <li
              key={index}
              className={cn(
                "rounded-xl border p-3",
                issue.severity === "error" ? "border-rose-400/25 bg-rose-400/[0.05]" : "border-solar/25 bg-solar/[0.05]",
              )}
            >
              <p className={cn("text-[11px] font-medium", issue.severity === "error" ? "text-rose-300" : "text-solar")}>
                {issue.title}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-white/55">{issue.detail}</p>
              {issue.fix && <p className="mt-1 text-[10px] leading-relaxed text-white/35">→ {issue.fix}</p>}
            </li>
          ))}
        </ul>
      )}

      {!empty && (
        <div className="mt-5 space-y-1.5 border-t border-white/[0.07] pt-4">
          {sim.objectives.map((objective) => (
            <div key={objective.targetId} className="flex items-start justify-between gap-3 text-[10px]">
              <span className="min-w-0 flex-1 truncate text-white/60">{objective.site}</span>
              <span
                className={cn(
                  "shrink-0",
                  objective.status === "feasible" ? "text-emerald-300" : "max-w-[62%] text-right leading-relaxed text-rose-300",
                )}
              >
                {objective.status === "feasible" ? "達成" : objective.reason}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onLaunch}
        disabled={!canLaunch}
        className={cn(
          "mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm transition-all duration-300",
          canLaunch ? "bg-ion text-[#04121a] hover:bg-white" : "cursor-not-allowed bg-white/10 text-white/35",
        )}
      >
        {locked ? `レベル ${planet.requiredLevel} が必要` : disabled ? "探査目的を選んでください" : "この設計で打ち上げる"}
        <ArrowRight className="h-4 w-4" />
      </button>

      {!locked && !disabled && sim.verdict === "fail" && (
        <p className="mt-3 text-[10px] leading-relaxed text-rose-300/80">
          この設計では発射台で中止されます。結果は報告書に記録されます。
        </p>
      )}
      {!locked && !disabled && sim.verdict === "partial" && (
        <p className="mt-3 text-[10px] leading-relaxed text-white/35">
          打ち上げは可能です。達成できない目標は運用中に理由が表示されます。
        </p>
      )}
      {!empty && sim.budget.used > 0 && (
        <p className="mt-2 text-[10px] text-white/25">総コスト {fmt(sim.budget.used)} 億円</p>
      )}
    </div>
  );
}