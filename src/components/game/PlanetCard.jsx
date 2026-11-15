import { Link } from "@tanstack/react-router";
import { Check, Lock, ArrowUpRight } from "lucide-react";
import PlanetVisual from "@/components/game/PlanetVisual";
import { cn } from "@/lib/utils";

export default function PlanetCard({ planet, level, foundIds = [] }) {
  const unlocked = level >= planet.requiredLevel;
  const found = foundIds.length;
  const complete = found >= planet.targets.length;

  const body = (
    <>
      <div className="relative flex h-40 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: `radial-gradient(circle at 50% 45%, ${planet.colors.glow}22, transparent 65%)` }}
        />
        <span className="absolute left-5 top-4 font-display text-[10px] tracking-[0.3em] text-white/35">
          {planet.code}
        </span>
        <span className="absolute right-4 top-4">
          {!unlocked ? (
            <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/40">
              <Lock className="h-3 w-3" /> Lv.{planet.requiredLevel}
            </span>
          ) : complete ? (
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">
              <Check className="h-3 w-3" /> 調査完了
            </span>
          ) : (
            <span className="rounded-full border border-ion/30 bg-ion/10 px-2 py-1 text-[10px] text-ion">探索可能</span>
          )}
        </span>
        <PlanetVisual planet={planet} size="md" ring={planet.id === "saturn"} className={cn(!unlocked && "opacity-45")} />
      </div>

      <div className="space-y-3 border-t border-white/[0.07] p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-xl font-medium text-white">{planet.name}</h3>
          <span className="font-display text-[10px] tracking-[0.24em] text-white/30">{planet.en}</span>
        </div>
        <p className="text-xs leading-relaxed text-dust">{planet.tagline}</p>
        <div className="flex items-center justify-between pt-1 text-[11px] text-white/45">
          <span className="font-display tracking-wider">{planet.distance}</span>
          <span>
            調査 {found} / {planet.targets.length}
          </span>
        </div>
        <div className="h-px w-full bg-white/[0.07]">
          <div
            className="h-px bg-ion transition-all duration-700"
            style={{ width: `${(found / planet.targets.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );

  if (!unlocked) {
    return (
      <div className="cursor-not-allowed overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02]">
        {body}
      </div>
    );
  }

  return (
    <Link
      to="/comms/$planetId"
      params={{ planetId: planet.id }}
      className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition-all duration-500 hover:-translate-y-1 hover:border-ion/40 hover:bg-white/[0.055] hover:shadow-[0_20px_60px_-30px_rgba(99,230,255,0.6)]"
    >
      {body}
      <span className="pointer-events-none absolute bottom-5 right-5 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4 text-ion" />
      </span>
    </Link>
  );
}