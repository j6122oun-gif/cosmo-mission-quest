import { equipmentById } from "@/lib/spaceData";
import {
  BUSES,
  COMMS,
  LAUNCHERS,
  ORBITS,
  ORBIT_NAMES,
  ORBIT_RANK,
  busById,
  commsById,
  launcherById,
  orbitById,
} from "@/lib/missionDesign";

export const VERDICT = {
  go: {
    label: "GO",
    title: "選んだ目標をすべて達成できる見込みです。",
    tone: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/[0.06]",
  },
  partial: {
    label: "CONDITIONAL",
    title: "一部の目標は達成できません。",
    tone: "text-solar",
    border: "border-solar/30",
    bg: "bg-solar/[0.06]",
  },
  fail: {
    label: "NO GO",
    title: "この設計ではミッションが成立しません。",
    tone: "text-rose-300",
    border: "border-rose-400/30",
    bg: "bg-rose-400/[0.06]",
  },
};

const round1 = (value) => Math.round(value * 10) / 10;

function metric(used, limit, unit) {
  const ok = used <= limit + 0.001;
  return {
    used: round1(used),
    limit: round1(limit),
    unit,
    ok,
    pct: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100,
    margin: round1(limit - used),
    marginPct: limit > 0 ? Math.round(((limit - used) / limit) * 100) : 0,
    over: ok ? 0 : round1(used - limit),
  };
}

export function simulateMission(planet, design) {
  const bus = busById[design.busId] || BUSES[1];
  const launcher = launcherById[design.launcherId] || LAUNCHERS[1];
  const orbit = orbitById[design.orbitId] || ORBITS[1];
  const comms = commsById[design.commsId] || COMMS[1];
  const env = planet.env || { lift: 1, comms: 1, power: 1 };
  const instruments = (design.instruments || []).map((id) => equipmentById[id]).filter(Boolean);

  const budget = metric(
    bus.cost + launcher.cost + orbit.cost + comms.cost + instruments.reduce((sum, item) => sum + item.cost, 0),
    planet.limits.budget,
    "億円",
  );

  const mass = metric(
    bus.dryMass + orbit.hardwareMass + comms.mass + instruments.reduce((sum, item) => sum + item.mass, 0),
    launcher.capacity * orbit.massFactor * env.lift,
    "kg",
  );

  const power = metric(
    (instruments.reduce((sum, item) => sum + item.power, 0) + comms.power) * env.power,
    bus.power,
    "kW",
  );

  const reachable = ORBIT_RANK[launcher.maxOrbit] >= orbit.rank;

  const commsCapacity = comms.bandwidth * env.comms;
  const chosen = (design.objectives || [])
    .map((id) => planet.targets.find((target) => target.id === id))
    .filter(Boolean);

  const data = metric(
    chosen.reduce((sum, target) => sum + (equipmentById[target.equipment]?.data || 0), 0),
    commsCapacity,
    "GB",
  );

  const carried = new Set(instruments.map((item) => item.id));
  const powered = new Set();
  let powerLeft = round1(bus.power - comms.power * env.power);
  let dataLeft = round1(commsCapacity);

  const objectives = chosen.map((target) => {
    const tool = equipmentById[target.equipment];
    const base = {
      targetId: target.id,
      site: target.site,
      title: target.title,
      points: target.points,
      equipmentId: tool.id,
      equipmentName: tool.name,
      orbitRequired: tool.minOrbit,
      data: tool.data,
    };

    if (!carried.has(tool.id)) {
      return { ...base, status: "blocked", reason: `「${tool.name}」を搭載していません` };
    }
    if (ORBIT_RANK[tool.minOrbit] > orbit.rank) {
      return { ...base, status: "blocked", reason: `${ORBIT_NAMES[tool.minOrbit]}が必要です` };
    }
    if (!powered.has(tool.id)) {
      const need = round1(tool.power * env.power);
      if (need > powerLeft) {
        return { ...base, status: "blocked", reason: `電力が ${round1(need - powerLeft)} kW 不足しています` };
      }
      powerLeft = round1(powerLeft - need);
      powered.add(tool.id);
    }
    if (tool.data > dataLeft) {
      return { ...base, status: "blocked", reason: `通信帯域が ${round1(tool.data - dataLeft)} GB 不足しています` };
    }
    dataLeft = round1(dataLeft - tool.data);
    return { ...base, status: "feasible", reason: null };
  });

  const feasibleCount = objectives.filter((item) => item.status === "feasible").length;
  const issues = [];

  if (!reachable) {
    const alt = LAUNCHERS.filter((item) => ORBIT_RANK[item.maxOrbit] >= orbit.rank).sort((a, b) => a.capacity - b.capacity)[0];
    issues.push({
      severity: "error",
      title: "打ち上げ機が軌道に届きません",
      detail: `${launcher.name} の到達上限は${ORBIT_NAMES[launcher.maxOrbit]}です。${orbit.name}ミッションにはより大きな打ち上げ能力が必要です。`,
      fix: alt ? `${alt.name} に変更してください。` : null,
    });
  }

  if (!budget.ok) {
    issues.push({
      severity: "error",
      title: `予算が ${budget.over} 億円 超過`,
      detail: `見積 ${budget.used} 億円 / 配分 ${budget.limit} 億円。`,
      fix: "搭載機器を減らすか、安価な機体・ロケット・通信系を選んでください。",
    });
  }

  if (!mass.ok && reachable) {
    const alt = LAUNCHERS.filter(
      (item) => ORBIT_RANK[item.maxOrbit] >= orbit.rank && item.capacity * orbit.massFactor * env.lift >= mass.used,
    ).sort((a, b) => a.capacity - b.capacity)[0];
    issues.push({
      severity: "error",
      title: `打ち上げ能力が ${mass.over} kg 不足`,
      detail: `打ち上げ質量 ${mass.used} kg / 能力 ${mass.limit} kg（${launcher.name} × ${orbit.name}効率 ${Math.round(orbit.massFactor * 100)}% × 惑星効率 ${Math.round(env.lift * 100)}%）。`,
      fix: alt
        ? `${alt.name} なら能力 ${Math.round(alt.capacity * orbit.massFactor * env.lift)} kg です。`
        : "軽い機体にするか、搭載機器を減らしてください。",
    });
  }

  if (!power.ok) {
    const alt = BUSES.filter((item) => item.power >= power.used).sort((a, b) => a.power - b.power)[0];
    issues.push({
      severity: "warn",
      title: `電力収支が ${power.over} kW 不足`,
      detail: `消費 ${power.used} kW / 発電 ${power.limit} kW（惑星の電力係数 ×${env.power}）。足りない分の機器は稼働できません。`,
      fix: alt
        ? `${alt.name}（${alt.power} kW）に変更するか、消費電力の大きい機器を外してください。`
        : "消費電力の大きい機器を外してください。",
    });
  }

  if (!data.ok) {
    const alt = COMMS.filter((item) => item.bandwidth * env.comms >= data.used).sort((a, b) => a.bandwidth - b.bandwidth)[0];
    issues.push({
      severity: "warn",
      title: `通信帯域が ${data.over} GB 不足`,
      detail: `必要 ${data.used} GB / 実効容量 ${data.limit} GB（地球との距離で ${Math.round(env.comms * 100)}% に低下）。帯域は選んだ順に割り当てるため、後ろの目標ほどデータを送れません。`,
      fix: alt ? `${alt.name} に変更するか、目標を減らしてください。` : "目標を減らしてください。",
    });
  }

  if (power.ok && power.marginPct < 10) {
    issues.push({
      severity: "warn",
      title: "電力の余裕が小さい",
      detail: `余裕は ${power.margin} kW（${power.marginPct}%）。機器を増やすとすぐに収支が崩れます。`,
      fix: null,
    });
  }

  if (mass.ok && mass.marginPct < 8) {
    issues.push({
      severity: "warn",
      title: "質量の余裕が小さい",
      detail: `余裕は ${mass.margin} kg（${mass.marginPct}%）。着陸機材や予備系を積む余地がありません。`,
      fix: null,
    });
  }

  const launchOk = budget.ok && mass.ok && reachable;
  const verdict = !launchOk
    ? "fail"
    : objectives.length > 0 && feasibleCount === objectives.length
      ? "go"
      : "partial";

  return {
    planetId: planet.id,
    design,
    budget,
    mass,
    power,
    data,
    orbit: { chosen: orbit.id, reachable, launcherMax: launcher.maxOrbit },
    objectives,
    feasibleCount,
    blockedCount: objectives.length - feasibleCount,
    launchOk,
    verdict,
    issues,
    equipment: instruments.map((item) => item.id),
    names: { bus: bus.name, launcher: launcher.name, orbit: orbit.name, comms: comms.name },
  };
}