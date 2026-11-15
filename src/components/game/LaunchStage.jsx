import { AnimatePresence, motion } from "framer-motion";
import StarField from "@/components/game/StarField";
import PlanetVisual from "@/components/game/PlanetVisual";

function Rocket({ thrust = false }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 60 160" className="h-36 w-auto drop-shadow-[0_0_26px_rgba(99,230,255,0.35)] sm:h-44">
        <defs>
          <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#eef6ff" />
            <stop offset="55%" stopColor="#b9c8d8" />
            <stop offset="100%" stopColor="#59667a" />
          </linearGradient>
        </defs>
        <path d="M30 4c9 14 14 30 14 48v40H16V52C16 34 21 18 30 4Z" fill="url(#rocketBody)" />
        <path d="M16 74 4 104l12-6V74Z" fill="#7c8899" />
        <path d="M44 74l12 30-12-6V74Z" fill="#7c8899" />
        <circle cx="30" cy="46" r="7" fill="#0a1020" stroke="#63e6ff" strokeWidth="1.5" />
        <rect x="22" y="92" width="16" height="8" rx="2" fill="#3b4654" />
      </svg>
      {thrust && (
        <motion.div
          className="absolute left-1/2 top-[96%] h-24 w-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-solar via-orange-400 to-transparent blur-[2px]"
          animate={{ scaleY: [1, 1.3, 0.9, 1.2, 1], opacity: [0.9, 1, 0.75, 1] }}
          transition={{ repeat: Infinity, duration: 0.35 }}
        />
      )}
    </div>
  );
}

export default function LaunchStage({ planet, phase, count }) {
  return (
    <div className="relative flex min-h-[72vh] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#04050a]">
      <StarField absolute />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_bottom,rgba(99,230,255,0.16),transparent_70%)]" />

      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        {phase === "countdown" && (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ opacity: 0, scale: 1.35, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                className="block font-display text-[26vw] font-bold leading-none tracking-tight text-white sm:text-[16rem]"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <p className="mt-4 font-display text-[10px] tracking-[0.5em] text-ion/70">T-MINUS</p>
          </div>
        )}

        {phase === "ignition" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 bottom-16 text-center"
          >
            <p className="font-display text-[10px] tracking-[0.5em] text-solar">IGNITION</p>
            <p className="mt-3 font-heading text-3xl font-medium text-white sm:text-4xl">打ち上げ</p>
          </motion.div>
        )}

        {phase === "travel" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 top-10 px-6"
          >
            <p className="font-display text-[10px] tracking-[0.4em] text-ion/70">CRUISE PHASE</p>
            <p className="mt-2 text-sm text-white/85">
              {planet.name} まで <span className="font-display text-xs">{planet.travel}</span>
            </p>
            <p className="mt-1 font-display text-[11px] tracking-[0.2em] text-white/30">{planet.distance}</p>
            <div className="mx-auto mt-5 h-px w-56 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-px bg-ion"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.2, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {phase === "countdown" && (
        <motion.div className="absolute bottom-10" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
          <Rocket />
        </motion.div>
      )}

      {phase === "ignition" && (
        <motion.div
          className="absolute bottom-10"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -620, opacity: 0 }}
          transition={{ duration: 1.9, ease: "easeIn" }}
        >
          <Rocket thrust />
        </motion.div>
      )}

      {phase === "travel" && (
        <motion.div
          className="absolute bottom-0 translate-y-1/3"
          initial={{ scale: 0.35, opacity: 0.2, y: 80 }}
          animate={{ scale: 1.15, opacity: 1, y: 0 }}
          transition={{ duration: 4.2, ease: "easeOut" }}
        >
          <PlanetVisual planet={planet} size="lg" ring={planet.id === "saturn"} className="!h-[26rem] !w-[26rem]" />
        </motion.div>
      )}
    </div>
  );
}