import { BUSES, COMMS, LAUNCHERS, MAX_OBJECTIVES, ORBITS, ORBIT_RANK, defaultDesign } from "@/lib/missionDesign";
import { simulateMission } from "@/lib/missionSim";
import { equipmentById } from "@/lib/spaceData";

export const INTENTS = [
  {
    id: "science",
    label: "できるだけ多くのデータを持ち帰りたい",
    short: "データ重視",
    reply: "データ優先、了解です。目標を詰め込んで、通信系に余裕を持たせます。",
  },
  {
    id: "safe",
    label: "安全第一で、確実に成果を出したい",
    short: "安全重視",
    reply: "安全優先、了解です。質量と電力の余裕を多めに残した設計にします。",
  },
  {
    id: "budget",
    label: "限られた予算で最大の成果を出したい",
    short: "予算重視",
    reply: "予算重視、了解です。安いロケットと機体で成立する組み合わせを探します。",
  },
];

// 目標の組み合わせ（最大 MAX_OBJECTIVES 件）をすべて列挙する
function objectiveCombos(targets) {
  const combos = [];
  const walk = (start, picked) => {
    if (picked.length) combos.push([...picked]);
    if (picked.length === MAX_OBJECTIVES) return;
    for (let i = start; i < targets.length; i += 1) {
      picked.push(targets[i]);
      walk(i + 1, picked);
      picked.pop();
    }
  };
  walk(0, []);
  return combos;
}

function scoreOf(sim, intentId) {
  const points = sim.objectives
    .filter((item) => item.status === "feasible")
    .reduce((sum, item) => sum + item.points, 0);
  // 予算重視：配分の7割以内で成果を最大化。安全重視：余裕を残しつつ成果も取る案。
  if (intentId === "budget") {
    const cap = sim.budget.limit * 0.7;
    return sim.budget.used > cap ? -1000 - sim.budget.used : points * 10 - sim.budget.used / 100;
  }
  if (intentId === "safe") {
    return Math.min(sim.mass.marginPct, sim.power.marginPct, 45) * 100 + points;
  }
  return points * 100 + sim.data.marginPct;
}

/**
 * 方針（intentId）に合う設計案を、実際のシミュレーションで成立するものから選ぶ。
 */
export function recommendDesign(planet, intentId, level = 1) {
  const intent = INTENTS.find((item) => item.id === intentId) || INTENTS[0];
  const buses = BUSES.filter((item) => item.level <= level);
  const antennas = COMMS.filter((item) => item.level <= level);
  const launchers = LAUNCHERS.filter((item) => item.level <= level);
  const targets = planet.targets.filter((target) => (equipmentById[target.equipment]?.level ?? 1) <= level);

  let bestGo = null;
  let bestPartial = null;

  objectiveCombos(targets).forEach((group) => {
    const instruments = [...new Set(group.map((target) => target.equipment))];
    ORBITS.forEach((orbit) => {
      launchers.forEach((launcher) => {
        if (ORBIT_RANK[launcher.maxOrbit] < orbit.rank) return;
        buses.forEach((bus) => {
          antennas.forEach((antenna) => {
            const design = {
              objectives: group.map((target) => target.id),
              instruments,
              busId: bus.id,
              launcherId: launcher.id,
              orbitId: orbit.id,
              commsId: antenna.id,
            };
            const sim = simulateMission(planet, design);
            const score = scoreOf(sim, intent.id);
            const candidate = { design, sim, score };
            if (sim.verdict === "go") {
              if (!bestGo || score > bestGo.score) bestGo = candidate;
            } else if (sim.verdict === "partial" && (!bestPartial || score > bestPartial.score)) {
              bestPartial = candidate;
            }
          });
        });
      });
    });
  });

  if (bestGo || bestPartial) return bestGo || bestPartial;

  const design = defaultDesign();
  design.objectives = targets.slice(0, MAX_OBJECTIVES).map((target) => target.id);
  design.instruments = [...new Set(targets.slice(0, MAX_OBJECTIVES).map((target) => target.equipment))];
  return { design, sim: simulateMission(planet, design), score: 0 };
}

export function encodePlan(design) {
  return [
    `o=${design.objectives.join(",")}`,
    `i=${design.instruments.join(",")}`,
    `b=${design.busId}`,
    `l=${design.launcherId}`,
    `r=${design.orbitId}`,
    `c=${design.commsId}`,
  ].join("~");
}

export function decodePlan(raw, planet) {
  if (typeof raw !== "string" || !raw || !planet) return null;
  const parts = {};
  raw.split("~").forEach((chunk) => {
    const [key, value = ""] = chunk.split("=");
    parts[key] = value;
  });
  const list = (value) => (value ? value.split(",").filter(Boolean) : []);
  const design = {
    objectives: list(parts.o)
      .filter((id) => planet.targets.some((target) => target.id === id))
      .slice(0, MAX_OBJECTIVES),
    instruments: list(parts.i).filter((id) => equipmentById[id]),
    busId: BUSES.some((item) => item.id === parts.b) ? parts.b : null,
    launcherId: LAUNCHERS.some((item) => item.id === parts.l) ? parts.l : null,
    orbitId: ORBITS.some((item) => item.id === parts.r) ? parts.r : null,
    commsId: COMMS.some((item) => item.id === parts.c) ? parts.c : null,
  };
  if (!design.busId || !design.launcherId || !design.orbitId || !design.commsId) return null;
  return design;
}