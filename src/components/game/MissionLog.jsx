import { Orbit, Radio, Rocket, Satellite } from "lucide-react";
import PlanetVisual from "@/components/game/PlanetVisual";
import { equipmentIcon } from "@/components/game/icons";
import { equipmentById, planetById } from "@/lib/spaceData";
import { cn } from "@/lib/utils";

const STATUS = {
  go: { label: "成功", className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  partial: { label: "一部達成", className: "border-solar/25 bg-solar/10 text-solar" },
  fail: { label: "中止", className: "border-rose-400/25 bg-rose-400/10 text-rose-300" },
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    });
  } catch {
    return "";
  }
}

export default function MissionLog({ missions = [] }) {
  if (!missions.length) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 px-5 py-6 text-xs leading-relaxed text-dust">
        まだ調査記録はありません。最初のミッションを計画して、月へ出発しましょう。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      {missions.slice(0, 4).map((mission, index) => {
        const planet = planetById(mission.planetId);
        const sim = mission.sim;
        const status = sim ? STATUS[sim.verdict] : null;
        const newCount = (mission.awarded || []).filter((item) => item.isNew).length;
        const awardedIds = (mission.awarded || []).map((item) => item.targetId);

        return (
          <li key={`${mission.date}-${index}`} className="px-4 py-4 sm:px-5">
            <div className="flex items-start gap-4">
              {planet && <PlanetVisual planet={planet} size="xs" ring={planet.id === "saturn"} />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-display text-[10px] tracking-[0.2em] text-white/30">
                    {formatDate(mission.date)}
                  </span>
                  <span className="text-sm text-white/85">{planet ? planet.name : "不明"}</span>
                  {status && (
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", status.className)}>
                      {status.label}
                    </span>
                  )}
                  <span className="ml-auto font-display text-xs text-ion">+{mission.gained} pt</span>
                </div>

                {sim?.names && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/45">
                    <span className="flex items-center gap-1">
                      <Orbit className="h-3 w-3 text-white/25" />
                      {sim.names.orbit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Rocket className="h-3 w-3 text-white/25" />
                      {sim.names.launcher}
                    </span>
                    <span className="flex items-center gap-1">
                      <Satellite className="h-3 w-3 text-white/25" />
                      {sim.names.bus}
                    </span>
                    <span className="flex items-center gap-1">
                      <Radio className="h-3 w-3 text-white/25" />
                      {sim.names.comms}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  {(sim?.objectives || []).map((objective) => {
                    const tool = equipmentById[objective.equipmentId];
                    const Icon = equipmentIcon(objective.equipmentId);
                    const achieved = awardedIds.includes(objective.targetId);
                    return (
                      <span
                        key={objective.targetId}
                        title={objective.site}
                        className={cn(
                          "grid h-6 w-6 place-items-center rounded-md border",
                          achieved ? "border-emerald-400/25 bg-emerald-400/10" : "border-white/10 bg-white/[0.03]",
                        )}
                        style={{ color: achieved ? tool?.accent : "rgba(255,255,255,0.2)" }}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                    );
                  })}
                  <span className="ml-1 text-[10px] text-dust">新規発見 {newCount}</span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}