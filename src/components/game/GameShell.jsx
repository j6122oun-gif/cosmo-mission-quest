import StarField from "@/components/game/StarField";
import { cn } from "@/lib/utils";

export default function GameShell({ children, className }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <StarField />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}