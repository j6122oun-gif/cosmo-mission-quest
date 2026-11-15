import { createFileRoute } from "@tanstack/react-router";
import { Compass, Sparkles } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import PlayerHud from "@/components/game/PlayerHud";
import PlanetCard from "@/components/game/PlanetCard";
import MissionLog from "@/components/game/MissionLog";
import { PLANETS, TOTAL_TARGETS, countFound } from "@/lib/spaceData";
import { levelFromXp } from "@/lib/gameProgress";
import { useGameProgress } from "@/lib/useGameProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: MissionControl,
  head: () => ({
    meta: [
      { title: "深宇宙調査計画 | ミッションコントロール" },
      {
        name: "description",
        content:
          "探査目的・機体・科学機器・打上げ機・軌道・通信を設計し、予算・質量・電力・通信帯域の制約と向き合うミッション設計シミュレーション。",
      },
    ],
  }),
});

function MissionControl() {
  const { progress, loading } = useGameProgress();
  const ready = !loading;
  const xp = progress?.xp ?? 0;
  const level = levelFromXp(xp).level;
  const found = countFound(progress?.discoveries);

  return (
    <GameShell>
      {!ready && (
        <div className="fixed inset-0 z-20 grid place-items-center">
          <p className="animate-pulse font-display text-[10px] tracking-[0.42em] text-dust">
            ORBITAL DATA SYNC
          </p>
        </div>
      )}

      <div className={cn("transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-ion/40 bg-ion/10">
                <Compass className="h-4 w-4 text-ion" />
              </span>
              <div>
                <p className="font-display text-[10px] tracking-[0.34em] text-white/45">ORBITAL SURVEY PROGRAM</p>
                <p className="text-sm text-white/80">深宇宙調査計画</p>
              </div>
            </div>
            <p className="font-display text-[10px] tracking-[0.3em] text-white/30">MISSION CONTROL</p>
          </header>

          <section className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="font-display text-[10px] tracking-[0.42em] text-ion/70">BRIEFING 001</p>
              <h1 className="mt-6 font-heading text-[2.6rem] font-medium leading-[1.12] tracking-tight text-white sm:text-6xl">
                知らない景色を、
                <br />
                <span className="text-ion">調べに行く。</span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-[1.9] text-dust">
                探査目的から機体、科学機器、打上げ機、軌道、通信まで。限られた予算・質量・電力・帯域のなかで
                ミッションを設計し、月から土星、そしてタイタンへ。あなたの発見が、宇宙の地図を書きかえていく。
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 right-0 flex items-center gap-2 text-[10px] tracking-[0.25em] text-white/25">
                <Sparkles className="h-3 w-3" /> LIVE TELEMETRY
              </div>
              <PlayerHud xp={xp} found={found} total={TOTAL_TARGETS} />
            </div>
          </section>

          <section className="mt-16 sm:mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-medium text-white">ミッション一覧</h2>
                <p className="mt-1 text-xs text-dust">レベルが上がると、より遠い惑星が解放されます。</p>
              </div>
              <span className="font-display text-[10px] tracking-[0.3em] text-white/30">
                {PLANETS.length} TARGETS
              </span>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PLANETS.map((planet) => (
                <PlanetCard
                  key={planet.id}
                  planet={planet}
                  level={level}
                  foundIds={progress?.discoveries?.[planet.id] || []}
                />
              ))}
            </div>
          </section>

          <section className="mt-16 sm:mt-24">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-lg font-medium text-white">調査記録</h2>
              <span className="font-display text-[10px] tracking-[0.3em] text-white/30">LOG</span>
            </div>
            <div className="mt-5">
              <MissionLog missions={progress?.missions || []} />
            </div>
          </section>

          <footer className="mt-20 border-t border-white/[0.07] pt-6 text-[11px] text-white/25">
            調査データはこのブラウザに保存されます。
          </footer>
        </div>
      </div>
    </GameShell>
  );
}