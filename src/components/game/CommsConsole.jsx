import { useEffect, useRef } from "react";
import { Radio } from "lucide-react";
import CommsBubble from "@/components/game/CommsBubble";

export default function CommsConsole({ planet, log, busy, choices }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log.length, busy]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-panel/80">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 font-display text-[10px] tracking-[0.24em] text-ion/70">
          <Radio className="h-3.5 w-3.5" />
          MISSION CONTROL
        </span>
        <span className="font-display text-[10px] tracking-[0.2em] text-white/30">
          {planet.code} / CH-01
        </span>
      </div>

      <div className="max-h-[50vh] space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {log.map((message) => (
          <CommsBubble key={message.id} from={message.from} text={message.text} />
        ))}
        {busy && (
          <p className="animate-twinkle font-display text-[10px] tracking-[0.24em] text-white/35">
            受信中 …
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="space-y-2 border-t border-white/[0.08] bg-white/[0.02] px-4 py-4 sm:px-6">
        {choices.length === 0 ? (
          <p className="text-[11px] text-white/30">交信を待っています…</p>
        ) : (
          <>
            <p className="text-[10px] tracking-[0.2em] text-white/35">返答を選択</p>
            {choices.map((choice, index) => (
              <button
                key={choice.label}
                type="button"
                onClick={choice.onPick}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-[12.5px] leading-relaxed text-white/75 transition-colors hover:border-ion/40 hover:bg-ion/[0.07] hover:text-white"
              >
                <span className="font-display text-[10px] text-ion/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {choice.label}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}