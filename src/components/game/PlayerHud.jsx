import { levelFromXp, nextLevelXp } from "@/lib/gameProgress";

export default function PlayerHud({ xp = 0, found = 0, total = 24 }) {
  const level = levelFromXp(xp);
  const next = nextLevelXp(xp);
  const pct = next === null ? 100 : Math.min(100, Math.round(((xp - level.xp) / (next - level.xp)) * 100));

  return (
    <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl sm:grid-cols-3 sm:divide-x sm:divide-white/[0.07]">
      <div className="p-5">
        <p className="font-display text-[10px] tracking-[0.32em] text-ion/70">LEVEL</p>
        <div className="mt-2 flex items-end gap-2.5">
          <span className="font-display text-4xl font-bold leading-none text-white">
            {String(level.level).padStart(2, "0")}
          </span>
          <span className="pb-0.5 text-xs text-dust">{level.title}</span>
        </div>
      </div>

      <div className="border-t border-white/[0.07] p-5 sm:border-t-0">
        <p className="font-display text-[10px] tracking-[0.32em] text-ion/70">EXPERIENCE</p>
        <p className="mt-2 font-display text-lg text-white">
          {xp}
          <span className="ml-1 text-xs text-dust">{next === null ? "XP ・ 最大" : `/ ${next} XP`}</span>
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ion to-nebula transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="border-t border-white/[0.07] p-5 sm:border-t-0">
        <p className="font-display text-[10px] tracking-[0.32em] text-ion/70">DISCOVERIES</p>
        <p className="mt-2 font-display text-lg text-white">
          {found}
          <span className="ml-1 text-xs text-dust">/ {total}</span>
        </p>
        <p className="mt-1 text-[11px] text-dust">集めた調査項目</p>
      </div>
    </div>
  );
}