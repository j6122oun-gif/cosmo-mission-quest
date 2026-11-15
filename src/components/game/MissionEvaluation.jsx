import { Orbit, Radio, Rocket, Satellite } from "lucide-react";
import { equipmentIcon } from "@/components/game/icons";
import MarginMeter from "@/components/design/MarginMeter";
import { VERDICT } from "@/lib/missionSim";
import { cn } from "@/lib/utils";

export default function MissionEvaluation({ sim, awardedIds = [] }) {
  const verdict = VERDICT[sim.verdict];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
        <p className="font-display text-[10px] tracking-[0.28em] text-white/35">MISSION EVALUATION</p>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-display text-[10px] tracking-[0.18em]",
            verdict.border,
            verdict.bg,
            verdict.tone,
          )}
        >
          {verdict.label}
        </span>
      </div>

      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/60">
          {[
            [Orbit, sim.names.orbit],
            [Rocket, sim.names.launcher],
            [Satellite, sim.names.bus],
            [Radio, sim.names.comms],
          ].map(([Icon, name]) => (
            <span key={name} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-white/30" />
              {name}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MarginMeter label="予算" {...sim.budget} />
          <MarginMeter label="打ち上げ質量" {...sim.mass} />
          <MarginMeter label="電力" {...sim.power} />
          <MarginMeter label="通信帯域" {...sim.data} />
        </div>
      </div>

      {sim.issues.length > 0 && (
        <ul className="divide-y divide-white/[0.06] border-t border-white/[0.07]">
          {sim.issues.map((issue, index) => (
            <li key={index} className="px-5 py-3">
              <p className={cn("text-[11px] font-medium", issue.severity === "error" ? "text-rose-300" : "text-solar")}>
                {issue.title}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/50">{issue.detail}</p>
              {issue.fix && <p className="mt-1 text-[11px] leading-relaxed text-white/35">→ {issue.fix}</p>}
            </li>
          ))}
        </ul>
      )}

      {sim.objectives.length > 0 && (
        <div className="border-t border-white/[0.07] px-5 py-4">
          <p className="text-[10px] tracking-[0.15em] text-white/30">目標ごとの結果</p>
          <ul className="mt-2 space-y-1.5">
            {sim.objectives.map((objective) => {
              const Icon = equipmentIcon(objective.equipmentId);
              const achieved = awardedIds.includes(objective.targetId);
              return (
                <li key={objective.targetId} className="flex items-start justify-between gap-3 text-[11px]">
                  <span className="flex min-w-0 items-center gap-2 text-white/65">
                    <Icon
                      className={cn("h-3.5 w-3.5 shrink-0", achieved ? "text-emerald-300" : "text-white/25")}
                    />
                    <span className="truncate">{objective.site}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-right",
                      achieved
                        ? "text-emerald-300"
                        : objective.status === "feasible"
                          ? "text-white/40"
                          : "max-w-[62%] text-rose-300",
                    )}
                  >
                    {achieved ? "達成" : objective.status === "feasible" ? "未取得" : objective.reason}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}