import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import GameShell from "@/components/game/GameShell";
import BackLink from "@/components/game/BackLink";
import CommsConsole from "@/components/game/CommsConsole";
import { planetById } from "@/lib/spaceData";
import { INTENTS, encodePlan, recommendDesign } from "@/lib/commsPlan";
import { againLines, intentReplyLines, introLines, proposalLines } from "@/lib/commsScript";
import { levelFromXp } from "@/lib/gameProgress";
import { useGameProgress } from "@/lib/useGameProgress";

export const Route = createFileRoute("/comms/$planetId")({
  component: CommsBriefing,
  head: () => ({
    meta: [{ title: "管制官との交信 | 深宇宙調査計画" }],
  }),
});

function CommsBriefing() {
  const { planetId } = Route.useParams();
  const navigate = useNavigate();
  const { progress, loading } = useGameProgress();
  const planet = planetById(planetId);
  const level = levelFromXp(progress?.xp ?? 0).level;

  const [log, setLog] = useState([]);
  const [queue, setQueue] = useState([]);
  const [stage, setStage] = useState("intro");
  const [intent, setIntent] = useState(null);
  const seq = useRef(0);

  const say = (lines) => {
    const items = lines
      .filter(Boolean)
      .map((text) => ({ id: `d${(seq.current += 1)}`, from: "director", text }));
    if (items.length) setQueue((current) => [...current, ...items]);
  };

  const reply = (text) => {
    setLog((current) => [...current, { id: `y${(seq.current += 1)}`, from: "you", text }]);
  };

  useEffect(() => {
    if (!planet) return;
    setLog([]);
    setQueue([]);
    setStage("intro");
    setIntent(null);
    setQueue(introLines(planet).map((text, index) => ({ id: `intro-${index}`, from: "director", text })));
  }, [planetId]);

  useEffect(() => {
    if (!queue.length) return;
    const timer = setTimeout(() => {
      setLog((current) => [...current, queue[0]]);
      setQueue((current) => current.slice(1));
    }, 620);
    return () => clearTimeout(timer);
  }, [queue]);

  const recommendation = useMemo(
    () => (planet && intent ? recommendDesign(planet, intent, level) : null),
    [planet, intent, level],
  );

  const busy = queue.length > 0 || loading;

  const pickIntent = (id) => {
    const chosen = INTENTS.find((item) => item.id === id);
    reply(chosen.label);
    setIntent(id);
    setStage("proposal");
    say([
      ...intentReplyLines(chosen),
      ...proposalLines(planet, recommendDesign(planet, id, level), chosen),
    ]);
  };

  const approve = () => {
    navigate({
      to: "/prep/$planetId",
      params: { planetId },
      search: { plan: encodePlan(recommendation.design) },
    });
  };

  const manual = () => navigate({ to: "/prep/$planetId", params: { planetId }, search: {} });

  const restart = () => {
    reply("別の狙いから考え直したい");
    setIntent(null);
    setStage("intro");
    say(againLines());
  };

  let choices = [];
  if (!busy) {
    if (stage === "intro") {
      choices = INTENTS.map((item) => ({ label: item.label, onPick: () => pickIntent(item.id) }));
    } else if (stage === "proposal") {
      choices = [
        { label: "その設計で進める", onPick: approve },
        { label: "別の狙いから考え直す", onPick: restart },
        { label: "自分で一から設計する", onPick: manual },
      ];
    }
  }

  if (!planet) {
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

  if (!loading && level < planet.requiredLevel) {
    return (
      <GameShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-sm text-dust">
            {planet.name}への探査はレベル {planet.requiredLevel} で解禁されます。
          </p>
          <Link to="/" className="mt-6 inline-block text-xs text-ion">
            ミッションコントロールへ戻る
          </Link>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <BackLink />

        <header className="mt-8">
          <div className="flex items-center gap-3 font-display text-[10px] tracking-[0.34em] text-ion/70">
            <span>{planet.code}</span>
            <span className="h-px w-8 bg-ion/30" />
            <span>COMMS BRIEFING</span>
          </div>
          <h1 className="mt-5 font-heading text-2xl font-medium text-white sm:text-3xl">
            管制官との交信
          </h1>
          <p className="mt-3 max-w-lg text-[12.5px] leading-[1.9] text-dust">
            管制官の質問に答えると、その方針に合わせた設計案が返ってきます。案のまま進んでも、自分で組み直しても構いません。
          </p>
        </header>

        <div className="mt-7">
          <CommsConsole planet={planet} log={log} busy={busy} choices={choices} />
        </div>
      </div>
    </GameShell>
  );
}