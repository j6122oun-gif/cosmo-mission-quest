import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Orbit, Radio, Rocket, Satellite } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import PlanetVisual from "@/components/game/PlanetVisual";
import BackLink from "@/components/game/BackLink";
import EquipmentOption from "@/components/game/EquipmentOption";
import SectionHeader from "@/components/design/SectionHeader";
import ChoiceCard from "@/components/design/ChoiceCard";
import ObjectiveRow from "@/components/design/ObjectiveRow";
import DesignSummary from "@/components/design/DesignSummary";
import MobileLaunchBar from "@/components/design/MobileLaunchBar";
import { BUSES, COMMS, LAUNCHERS, MAX_OBJECTIVES, ORBITS, defaultDesign } from "@/lib/missionDesign";
import { EQUIPMENT, equipmentById, planetById } from "@/lib/spaceData";
import { simulateMission } from "@/lib/missionSim";
import { levelFromXp, setCurrentMission } from "@/lib/gameProgress";
import { decodePlan } from "@/lib/commsPlan";
import { useGameProgress } from "@/lib/useGameProgress";

export const Route = createFileRoute("/prep/$planetId")({
  validateSearch: (search) => ({ plan: typeof search.plan === "string" ? search.plan : undefined }),
  component: DesignWorkspace,
  head: () => ({
    meta: [{ title: "ミッション設計 | 深宇宙調査計画" }],
  }),
});

function DesignWorkspace() {
  const { planetId } = Route.useParams();
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const { progress, loading } = useGameProgress();
  const planet = planetById(planetId);
  const [design, setDesign] = useState(() => decodePlan(plan, planet) || defaultDesign());

  useEffect(() => {
    setDesign(decodePlan(plan, planet) || defaultDesign());
  }, [planetId, plan]);

  const sim = useMemo(() => (planet ? simulateMission(planet, design) : null), [planet, design]);

  if (!planet || !sim) {
    return (
      <GameShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-sm text-dust">指定された惑星が見つかりませんでした。</p>
          <Link to="/" className="mt-6 inline-block text-xs text-ion">
            ミッションコントロールへ戻る
          </Link>
        </div>
      </GameShell>
    );
  }

  const level = levelFromXp(progress?.xp ?? 0).level;
  const locked = level < planet.requiredLevel;
  const found = progress?.discoveries?.[planet.id]?.length || 0;
  const env = planet.env;

  const update = (patch) => setDesign((current) => ({ ...current, ...patch }));

  const toggleObjective = (id) => {
    setDesign((current) => {
      if (current.objectives.includes(id)) {
        return { ...current, objectives: current.objectives.filter((item) => item !== id) };
      }
      if (current.objectives.length >= MAX_OBJECTIVES) return current;
      return { ...current, objectives: [...current.objectives, id] };
    });
  };

  const toggleInstrument = (item) => {
    if (level < item.level) return;
    setDesign((current) => ({
      ...current,
      instruments: current.instruments.includes(item.id)
        ? current.instruments.filter((id) => id !== item.id)
        : [...current.instruments, item.id],
    }));
  };

  const launch = () => {
    if (loading || locked || design.objectives.length === 0) return;
    setCurrentMission(planet.id, design, sim);
    navigate({ to: "/launch/$planetId", params: { planetId: planet.id } });
  };

  return (
    <GameShell>
      <div className="mx-auto max-w-6xl px-5 pb-32 pt-8 sm:px-8 sm:pt-10 lg:pb-24">
        <BackLink />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10">
          <div className="space-y-11">
            <div>
              <div className="flex items-center gap-3 font-display text-[10px] tracking-[0.34em] text-ion/70">
                <span>{planet.code}</span>
                <span className="h-px w-8 bg-ion/30" />
                <span>DESIGN WORKSPACE</span>
              </div>

              <div className="mt-7 flex items-center gap-6">
                <PlanetVisual planet={planet} size="md" ring={planet.id === "saturn"} />
                <div>
                  <h1 className="font-heading text-3xl font-medium text-white sm:text-4xl">{planet.name}</h1>
                  <p className="mt-2 font-display text-[10px] tracking-[0.3em] text-white/35">{planet.en}</p>
                  <p className="mt-3 max-w-[15rem] text-xs leading-relaxed text-ion/80">{planet.tagline}</p>
                </div>
              </div>

              <p className="mt-6 max-w-xl text-[13px] leading-[1.95] text-dust">{planet.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-4">
                {[
                  ["距離", planet.distance],
                  ["航行", planet.travel],
                  ["重力", planet.gravity],
                  ["気温", planet.temperature],
                ].map(([label, value]) => (
                  <div key={label} className="bg-void/80 p-4">
                    <p className="text-[10px] tracking-[0.15em] text-white/35">{label}</p>
                    <p className="mt-1 text-[12px] text-white/85">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[
                  ["通信効率", `${Math.round(env.comms * 100)}%`],
                  ["打上げ効率", `${Math.round(env.lift * 100)}%`],
                  ["電力係数", `×${env.power}`],
                ].map(([label, value]) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/45"
                  >
                    {label} <span className="text-white/85">{value}</span>
                  </span>
                ))}
              </div>
              {env.note && <p className="mt-3 text-[11px] leading-relaxed text-solar/80">{env.note}</p>}

              <p className="mt-4 text-[11px] leading-relaxed text-white/40">
                探査目的を選び、その目標に必要な機器・軌道・打上げ機・通信系を決めます。試算パネルの余裕を見ながら、
                すべての条件が成り立つ設計にまとめてください。
              </p>
            </div>

            <section>
              <SectionHeader
                index="01"
                title="探査目的（サイエンス目標）"
                hint={`この惑星で何を明らかにするかを選びます。最大 ${MAX_OBJECTIVES} 件。目標ごとに必要な機器・軌道・データ量が違います。`}
                aside={
                  <span className="font-display text-[10px] tracking-[0.2em] text-white/30">
                    {design.objectives.length} / {MAX_OBJECTIVES}
                  </span>
                }
              />
              <ul className="mt-4 space-y-2">
                {planet.targets.map((target) => {
                  const selected = design.objectives.includes(target.id);
                  const row = sim.objectives.find((item) => item.targetId === target.id);
                  return (
                    <li key={target.id}>
                      <ObjectiveRow
                        target={target}
                        tool={equipmentById[target.equipment]}
                        selected={selected}
                        disabled={!selected && design.objectives.length >= MAX_OBJECTIVES}
                        toolLocked={level < equipmentById[target.equipment].level}
                        reason={row?.reason}
                        onToggle={() => toggleObjective(target.id)}
                      />
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[10px] text-white/30">
                既知の発見 {found} / {planet.targets.length} 件
              </p>
            </section>

            <section>
              <SectionHeader
                index="02"
                title="軌道"
                hint="近づくほど多くの調査ができるが、軌道投入の機材と質量がかさみます。"
              />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {ORBITS.map((item) => (
                  <ChoiceCard
                    key={item.id}
                    icon={Orbit}
                    name={item.name}
                    en={item.en}
                    desc={item.desc}
                    selected={design.orbitId === item.id}
                    onSelect={() => update({ orbitId: item.id })}
                    stats={[
                      { label: "質量効率", value: `${Math.round(item.massFactor * 100)}%` },
                      { label: "費用", value: `${item.cost} 億円` },
                      { label: "機材", value: `+${item.hardwareMass} kg` },
                    ]}
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-white/30">
                観測できる範囲：{ORBITS.find((item) => item.id === design.orbitId)?.ability}
              </p>
            </section>

            <section>
              <SectionHeader
                index="03"
                title="打上げ機"
                hint="到達できる軌道と、運べる質量が決まります。実効能力はロケット × 軌道効率 × 惑星の打上げ効率です。"
                aside={
                  <span className="font-display text-[10px] tracking-[0.16em] text-white/40">
                    能力 {sim.mass.limit} kg
                  </span>
                }
              />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {LAUNCHERS.map((item) => (
                  <ChoiceCard
                    key={item.id}
                    icon={Rocket}
                    name={item.name}
                    en={item.en}
                    desc={item.desc}
                    selected={design.launcherId === item.id}
                    onSelect={() => update({ launcherId: item.id })}
                    stats={[
                      { label: "能力", value: `${item.capacity} kg` },
                      { label: "到達", value: { flyby: "フライバイ", orbit: "周回", lander: "着陸" }[item.maxOrbit] },
                      { label: "費用", value: `${item.cost} 億円` },
                    ]}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                index="04"
                title="機体（バス）"
                hint="発電量と機体質量のトレードオフ。大型ほど電力を供給できるが、打ち上げ質量を圧迫します。"
                aside={
                  <span className="font-display text-[10px] tracking-[0.16em] text-white/40">
                    発電 {sim.power.limit} kW
                  </span>
                }
              />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {BUSES.map((item) => (
                  <ChoiceCard
                    key={item.id}
                    icon={Satellite}
                    name={item.name}
                    en={item.en}
                    desc={item.desc}
                    selected={design.busId === item.id}
                    locked={level < item.level}
                    requiredLevel={item.level}
                    onSelect={() => update({ busId: item.id })}
                    stats={[
                      { label: "発電", value: `${item.power} kW` },
                      { label: "機体", value: `${item.dryMass} kg` },
                      { label: "費用", value: `${item.cost} 億円` },
                    ]}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                index="05"
                title="科学機器"
                hint="目標の観測に必要な機器を搭載します。積むほど質量と電力を消費します。"
                aside={
                  <span className="font-display text-[10px] tracking-[0.2em] text-white/30">
                    {design.instruments.length} 基
                  </span>
                }
              />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {EQUIPMENT.map((item) => (
                  <EquipmentOption
                    key={item.id}
                    item={item}
                    selected={design.instruments.includes(item.id)}
                    locked={level < item.level}
                    onToggle={() => toggleInstrument(item)}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                index="06"
                title="通信系"
                hint="目標のデータを地球へ送る容量を決めます。距離が遠い惑星ほど同じアンテナでも帯域が落ちます。"
                aside={
                  <span className="font-display text-[10px] tracking-[0.16em] text-white/40">
                    実効 {sim.data.limit} GB
                  </span>
                }
              />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {COMMS.map((item) => (
                  <ChoiceCard
                    key={item.id}
                    icon={Radio}
                    name={item.name}
                    en={item.en}
                    desc={item.desc}
                    selected={design.commsId === item.id}
                    locked={level < item.level}
                    requiredLevel={item.level}
                    onSelect={() => update({ commsId: item.id })}
                    stats={[
                      { label: "帯域", value: `${item.bandwidth} GB` },
                      { label: "質量", value: `${item.mass} kg` },
                      { label: "電力", value: `${item.power} kW` },
                    ]}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
            <DesignSummary
              planet={planet}
              sim={sim}
              locked={locked}
              disabled={design.objectives.length === 0}
              onLaunch={launch}
            />
          </div>
        </div>
      </div>

      <MobileLaunchBar
        sim={sim}
        locked={locked}
        disabled={design.objectives.length === 0}
        onLaunch={launch}
      />
    </GameShell>
  );
}