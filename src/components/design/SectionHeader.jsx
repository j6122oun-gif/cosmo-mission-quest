export default function SectionHeader({ index, title, hint, aside }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-display text-[10px] tracking-[0.2em] text-ion/60">{index}</span>
        <div>
          <h2 className="font-heading text-sm font-medium text-white">{title}</h2>
          {hint && <p className="mt-1 max-w-md text-[11px] leading-relaxed text-dust">{hint}</p>}
        </div>
      </div>
      {aside && <div className="shrink-0 text-right">{aside}</div>}
    </div>
  );
}