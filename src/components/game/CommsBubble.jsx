import { Headset, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommsBubble({ from, text }) {
  const director = from === "director";

  return (
    <div className={cn("flex gap-3", !director && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
          director ? "border-ion/30 bg-ion/10 text-ion" : "border-white/15 bg-white/[0.06] text-white/55",
        )}
      >
        {director ? <Headset className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
      </span>
      <div
        className={cn(
          "max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-[1.9]",
          director
            ? "border border-white/[0.08] bg-white/[0.035] text-white/80"
            : "bg-ion/[0.12] text-ion",
        )}
      >
        <p
          className={cn(
            "mb-1 font-display text-[9px] tracking-[0.24em]",
            director ? "text-ion/50" : "text-ion/60",
          )}
        >
          {director ? "MISSION CONTROL" : "YOU"}
        </p>
        <p>{text}</p>
      </div>
    </div>
  );
}