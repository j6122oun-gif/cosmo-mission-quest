import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import GameShell from "@/components/game/GameShell";
import LaunchStage from "@/components/game/LaunchStage";
import { planetById } from "@/lib/spaceData";
import { recordMission } from "@/lib/gameProgress";
import { useGameProgress } from "@/lib/useGameProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/launch/$planetId")({
  component: LaunchPage,
  head: () => ({
    meta: [{ title: "打ち上げ | 深宇宙調査計画" }],
  }),
});

function LaunchPage() {
  const { planetId } = Route.useParams();
  const navigate = useNavigate();
  const { progress, loading } = useGameProgress();
  const [phase, setPhase] = useState("countdown");
  const [count, setCount] = useState(3);
  const planet = planetById(planetId);
  const mission = progress?.currentMission;
  const ready = !loading && mission?.planetId === planetId;
  const sim = mission?.sim;
  const aborted = !!sim && !sim.launchOk;

  const goExplore = () => navigate({ to: "/explore/$planetId", params: { planetId } });
  const goPrep = () => navigate({ to: "/prep/$planetId", params: { planetId } });
  const goReport = () => {
    recordMission(planetId, [], sim);
    navigate({ to: "/results/$planetId", params: { planetId } });
  };

  useEffect(() => {
    if (!loading && planet && !ready) {
      navigate({ to: "/prep/$planetId", params: { planetId } });
    }
  }, [loading, ready, planet, planetId, navigate]);

  useEffect(() => {
    if (phase !== "countdown" || !ready) return;
    if (count === 0) {
      setPhase(aborted ? "aborted" : "ignition");
      return;
    }
    const timer = setTimeout(() => setCount((value) => value - 1), 950);
    return () => clearTimeout(timer);
  }, [phase, count, ready, aborted]);

  useEffect(() => {
    if (phase === "ignition") {
      const timer = setTimeout(() => setPhase("travel"), 2000);
      return () => clearTimeout(timer);
    }
    if (phase === "travel") {
      const timer = setTimeout(() => navigate({ to: "/explore/$planetId", params: { planetId } }), 4400);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate, planetId]);

  if (!planet) {
    return (
      <GameShell>
        <div className="grid min-h-screen place-items-center">
          <p className="text-sm text-dust">ミッション情報が見つかりません。</p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-[10px] tracking-[0.32em] text-white/40">LAUNCH SEQUENCE</p>
            {sim?.names && (
              <p className="mt-1.5 font-display text-[10px] tracking-[0.16em] text-white/25">
                {sim.names.launcher} / {sim.names.orbit} / {sim.names.bus} / {sim.names.comms}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => (aborted ? setPhase("aborted") : goExplore())}
            className="shrink-0 text-[11px] tracking-[0.18em] text-white/40 transition-colors hover:text-ion"
          >
            スキップ →
          </button>
        </div>

        {phase === "aborted" ? (
          <AbortPanel sim={sim} planet={planet} onPrep={goPrep} onReport={goReport} />
        ) : ready ? (
          <LaunchStage planet={planet} phase={phase} count={count} />
        ) : (
          <div className="grid min-h-[72vh] place-items-center rounded-[2rem] border border-white/10">
            <p className="animate-pulse font-display text-[10px] tracking-[0.4em] text-dust">STANDBY</p>
          </div>
        )}
      </div>
    </GameShell>
  );
}

function AbortPanel({ sim, planet, onPrep, onReport }) {
  const failures = sim.issues.filter((issue) => issue.severity === "error");

  return (
    <div className="overflow-hidden rounded-[2rem] border border-rose-400/25 bg-rose-400/[0.04]">
      <div className="px-6 py-9 sm:px-10 sm:py-11">
        <p className="font-display text-[10px] tracking-[0.4em] text-rose-300">LAUNCH ABORT</p>
        <h1 className="mt-4 font-heading text-2xl font-medium text-white sm:text-3xl">打ち上げを中止しました</h1>
        <p className="mt-3 max-w-lg text-[12px] leading-[1.9] text-white/55">
          {planet.name}へのミッションは設計条件を満たしていないため、発射台で停止しました。理由を確認して設計を見直してください。
        </p>

        <ul className="mt-6 space-y-2">
          {failures.map((issue, index) => (
            <li key={index} className="rounded-xl border border-white/10 bg-void/60 p-4">
              <p className="text-[12px] font-medium text-rose-300">{issue.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/55">{issue.detail}</p>
              {issue.fix && <p className="mt-1 text-[11px] leading-relaxed text-white/35">→ {issue.fix}</p>}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPrep}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ion px-6 py-3.5 text-sm text-[#04121a] transition-colors hover:bg-white"
          >
            設計を見直す
          </button>
          <button
            type="button"
            onClick={onReport}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm text-white transition-colors hover:bg-white/15",
            )}
          >
            報告書を見る
          </button>
        </div>
      </div>
    </div>
  );
}