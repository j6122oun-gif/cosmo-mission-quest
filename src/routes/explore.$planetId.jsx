import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import StarField from "@/components/game/StarField";
import SurveyCard from "@/components/game/SurveyCard";
import { equipmentById, planetById } from "@/lib/spaceData";
import { recordMission } from "@/lib/gameProgress";
import { useGameProgress } from "@/lib/useGameProgress";

export const Route = createFileRoute("/explore/$planetId")({
  component: ExplorePage,
  head: () => ({
    meta: [{ title: "惑星調査 | 深宇宙調査計画" }],
  }),
});

function ExplorePage() {
  const { planetId } = Route.useParams();
  const navigate = useNavigate();
  const { progress, loading } = useGameProgress();
  const [found, setFound] = useState([]);
  const [scanning, setScanning] = useState(null);
  const planet = planetById(planetId);

  const mission = progress?.currentMission;
  const sim = mission?.sim;
  const equipped = mission?.design?.instruments || mission?.equipment || [];

  useEffect(() => {
    if (loading || !planet) return;
    if (mission?.planetId !== planetId) {
      navigate({ to: "/prep/$planetId", params: { planetId } });
    }
  }, [loading, mission, planet, planetId, navigate]);

  if (!planet) {
    return (
      <GameShell>
        <div className="grid min-h-screen place-items-center">
          <p className="text-sm text-dust">惑星データが見つかりません。</p>
        </div>
      </GameShell>
    );
  }

  const rows = sim?.objectives
    ? sim.objectives
        .map((objective) => ({ target: planet.targets.find((target) => target.id === objective.targetId), sim: objective }))
        .filter((row) => row.target)
    : planet.targets.map((target) => ({ target, sim: null }));

  const scan = (target) => {
    if (scanning || found.includes(target.id)) return;
    setScanning(target.id);
    setTimeout(() => {
      setFound((previous) => [...previous, target.id]);
      setScanning(null);
    }, 1500);
  };

  const finish = () => {
    recordMission(planet.id, found, sim);
    navigate({ to: "/results/$planetId", params: { planetId: planet.id } });
  };

  const points = rows
    .map((row) => row.target)
    .filter((target) => found.includes(target.id))
    .reduce((sum, target) => sum + target.points, 0);

  return (
    <GameShell>
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-8 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
          <div className="relative h-56 sm:h-72">
            <StarField absolute />
            <div
              className="absolute -bottom-[135%] left-1/2 h-[190%] w-[220%] -translate-x-1/2 rounded-full"
              style={{
                background: `radial-gradient(circle at 50% 12%, ${planet.colors.base} 0%, ${planet.colors.shade} 62%)`,
                boxShadow: `0 -30px 120px -40px ${planet.colors.glow}`,
              }}
            />
            <div
              className="absolute inset-x-0 bottom-[46%] h-24 opacity-70 blur-2xl"
              style={{ background: `radial-gradient(ellipse at 50% 100%, ${planet.colors.glow}88, transparent 70%)` }}
            />
            <div className="absolute inset-x-0 top-0 flex items-end justify-between p-6">
              <div>
                <p className="font-display text-[10px] tracking-[0.34em] text-white/45">SURFACE OPERATION</p>
                <h1 className="mt-2 font-heading text-3xl font-medium text-white sm:text-4xl">{planet.name}</h1>
              </div>
              <div className="text-right">
                <p className="font-display text-[10px] tracking-[0.2em] text-white/40">SURVEYED</p>
                <p className="mt-1 font-display text-lg text-white">
                  {found.length}
                  <span className="text-xs text-white/40"> / {rows.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {sim?.names && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] text-white/55">
            <span className="font-display text-[9px] tracking-[0.24em] text-white/30">MISSION PROFILE</span>
            <span>{sim.names.orbit}</span>
            <span className="text-white/20">/</span>
            <span>{sim.names.launcher}</span>
            <span className="text-white/20">/</span>
            <span>{sim.names.bus}</span>
            <span className="text-white/20">/</span>
            <span>{sim.names.comms}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-4">
          {[
            ["距離", planet.distance],
            ["重力", planet.gravity],
            ["気温", planet.temperature],
            ["自転周期", planet.dayLength],
          ].map(([label, value]) => (
            <div key={label} className="bg-void/80 px-4 py-3">
              <p className="text-[10px] tracking-[0.12em] text-white/35">{label}</p>
              <p className="mt-1 text-[12px] text-white/85">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-lg text-[11px] leading-relaxed text-dust">
            設計した装備と軌道で調査ポイントを観測します。設計の制約で達成できない目標には理由が表示されます。
          </p>
          <p className="font-display text-xs text-ion">+{points} pt</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map(({ target, sim: objective }) => {
            const equipment = equipmentById[target.equipment];
            const state = found.includes(target.id)
              ? "found"
              : scanning === target.id
                ? "scanning"
                : objective
                  ? objective.status === "feasible"
                    ? "ready"
                    : "blocked"
                  : equipped.includes(target.equipment)
                    ? "ready"
                    : "missing";
            return (
              <SurveyCard
                key={target.id}
                target={target}
                equipment={equipment}
                state={state}
                reason={objective?.reason}
                onScan={() => scan(target)}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={finish}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-ion px-6 py-3.5 text-sm text-[#04121a] transition-colors hover:bg-white"
        >
          調査を終了して報告する
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </GameShell>
  );
}