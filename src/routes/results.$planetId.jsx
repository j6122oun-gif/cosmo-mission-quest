import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import PlanetVisual from "@/components/game/PlanetVisual";
import MissionEvaluation from "@/components/game/MissionEvaluation";
import { EQUIPMENT, PLANETS, planetById } from "@/lib/spaceData";
import { levelFromXp, nextLevelXp } from "@/lib/gameProgress";
import { useGameProgress } from "@/lib/useGameProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results/$planetId")({
  component: ResultsPage,
  head: () => ({
    meta: [{ title: "調査報告 | 深宇宙調査計画" }],
  }),
});

function ResultsPage() {
  const { planetId } = Route.useParams();
  const { progress, loading } = useGameProgress();
  const planet = planetById(planetId);
  const result = progress?.lastResult;

  if (!loading && (!result || result.planetId !== planetId || !planet)) {
    return (
      <GameShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-sm text-dust">表示できる調査報告がありません。</p>
          <Link to="/" className="mt-6 inline-block text-xs text-ion">
            ミッションコントロールへ戻る
          </Link>
        </div>
      </GameShell>
    );
  }

  if (!result || !planet) {
    return (
      <GameShell>
        <div className="grid min-h-screen place-items-center">
          <p className="animate-pulse font-display text-[10px] tracking-[0.4em] text-dust">SYNCING</p>
        </div>
      </GameShell>
    );
  }

  const levelInfo = levelFromXp(result.xpAfter);
  const next = nextLevelXp(result.xpAfter);
  const start = levelFromXp(result.xpBefore).xp;
  const span = (next ?? result.xpAfter) - start;
  const pct = span > 0 ? Math.min(100, Math.round(((result.xpAfter - start) / span) * 100)) : 100;
  const leveledUp = result.levelAfter > result.levelBefore;
  const newPlanets = PLANETS.filter((p) => p.requiredLevel === result.levelAfter);
  const newEquipment = EQUIPMENT.filter((e) => e.level === result.levelAfter);
  const foundCount = progress?.discoveries?.[planet.id]?.length || 0;
  const newCount = result.awarded.filter((item) => item.isNew).length;
  const failed = result.sim?.verdict === "fail";

  return (
    <GameShell>
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <div className="text-center">
          <p className="font-display text-[10px] tracking-[0.42em] text-ion/70">
            {failed ? "LAUNCH ABORT REPORT" : "MISSION REPORT"}
          </p>
          <h1 className="mt-5 font-heading text-3xl font-medium text-white sm:text-4xl">
            {failed ? "ミッション中断" : "ミッション完了"}
          </h1>
          <div className="mt-8 flex items-center justify-center gap-4">
            <PlanetVisual planet={planet} size="sm" ring={planet.id === "saturn"} />
            <div className="text-left">
              <p className="font-heading text-xl text-white">{planet.name}</p>
              <p className="mt-1 font-display text-[10px] tracking-[0.24em] text-white/35">{planet.en}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
          {[
            ["獲得ポイント", `${result.gained} pt`],
            ["新規発見", `${newCount} 件`],
            ["累計調査", `${foundCount} / ${planet.targets.length}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-void/80 px-3 py-5 text-center">
              <p className="text-[10px] tracking-[0.12em] text-white/35">{label}</p>
              <p className="mt-2 font-display text-base text-white">{value}</p>
            </div>
          ))}
        </div>

        {result.sim && (
          <MissionEvaluation sim={result.sim} awardedIds={result.awarded.map((item) => item.targetId)} />
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <p className="border-b border-white/[0.07] px-5 py-3 font-display text-[10px] tracking-[0.28em] text-white/35">
            DISCOVERIES
          </p>
          <ul className="divide-y divide-white/[0.06]">
            {result.awarded.length === 0 && (
              <li className="px-5 py-6 text-xs text-dust">今回は新しい発見がありませんでした。</li>
            )}
            {result.awarded.map((item) => {
              const target = planet.targets.find((t) => t.id === item.targetId);
              if (!target) return null;
              return (
                <li key={item.targetId} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm text-white/90">{target.title}</p>
                    <p className="mt-1 text-[11px] text-dust">{target.site}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px]",
                      item.isNew ? "bg-ion/15 text-ion" : "bg-white/[0.06] text-white/35",
                    )}
                  >
                    {item.isNew ? `+${item.points} pt` : "既知"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-baseline justify-between text-[11px]">
            <span className="text-dust">
              LEVEL {String(result.levelBefore).padStart(2, "0")} → {" "}
              <span className="text-white">{String(result.levelAfter).padStart(2, "0")}</span>
            </span>
            <span className="font-display text-white/70">{result.xpAfter} XP</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ion to-nebula"
              initial={{ width: `${Math.max(0, pct - 18)}%` }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-dust">
            {levelInfo.title}
            {next !== null ? ` ・ 次のレベルまで ${next - result.xpAfter} XP` : " ・ 最高レベル"}
          </p>
        </div>

        {leveledUp && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-2xl border border-ion/30 bg-ion/[0.07] p-5"
          >
            <p className="flex items-center gap-2 font-display text-[10px] tracking-[0.3em] text-ion">
              <Sparkles className="h-3.5 w-3.5" /> LEVEL UP
            </p>
            <p className="mt-2 font-heading text-lg text-white">
              レベル {result.levelAfter} ・ {levelInfo.title}
            </p>
            <ul className="mt-3 space-y-1 text-[12px] text-white/70">
              {newEquipment.map((item) => (
                <li key={item.id}>新しい装備「{item.name}」が解放されました。</li>
              ))}
              {newPlanets.map((p) => (
                <li key={p.id}>新しい惑星「{p.name}」へのミッションが承認されました。</li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm text-white transition-colors hover:bg-white/15"
          >
            ミッションコントロールへ
          </Link>
          <Link
            to="/prep/$planetId"
            params={{ planetId: planet.id }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ion px-6 py-3.5 text-sm text-[#04121a] transition-colors hover:bg-white"
          >
            この惑星を再調査
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </GameShell>
  );
}