import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";

function useGlitchText(text: string, active: boolean) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!active) {
      setOutput(text);
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setOutput(
        text
          .split("")
          .map((char, idx) => {
            if (char === " ") return " ";
            if (idx < iteration) return text[idx];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 0.5;
    }, 30);
    return () => clearInterval(interval);
  }, [active, text]);

  return output;
}

const SCANLINE_COUNT = 8;

const HexGrid = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="hexPat" width="56" height="48" patternUnits="userSpaceOnUse">
        <polygon
          points="14,0 42,0 56,24 42,48 14,48 0,24"
          fill="none"
          stroke="#00F2FE"
          strokeWidth="1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hexPat)" />
  </svg>
);

const FloatingParticle = ({ delay, x, duration }: { delay: number; x: string; duration: number }) => (
  <motion.div
    className="absolute w-px bg-cyan-400/60 pointer-events-none"
    style={{ left: x, bottom: 0 }}
    initial={{ height: 0, opacity: 0, y: 0 }}
    animate={{ height: [0, 80, 0], opacity: [0, 0.8, 0], y: [0, -300] }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  />
);

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="w-full font-mono text-[10px] tracking-widest">
    <div className="flex justify-between mb-1">
      <span className="text-cyan-400/70">{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 bg-white/5 w-full relative overflow-hidden clip-cyber-md">
      <motion.div
        className="h-full"
        style={{ background: color }}
        initial={{ width: "0%" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
    </div>
  </div>
);

const UnderMaintenance = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const title = useGlitchText("SYSTEM_OFFLINE", glitchActive);

  useEffect(() => {
    const trigger = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 1200);
    };
    trigger();
    const id = setInterval(trigger, 5000);
    return () => clearInterval(id);
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const hexTick = tick.toString(16).toUpperCase().padStart(4, "0");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-background overflow-hidden">
      {/* Hex grid background */}
      <HexGrid />

      {/* Dense cyber grid */}
      <div className="absolute inset-0 cyber-grid-dense opacity-60 pointer-events-none" />

      {/* Glitch overlay scanlines */}
      <div className="glitch-overlay" />

      {/* Animated scanline beam */}
      <div className="cyber-scanline" />

      {/* Floating vertical particles */}
      {[...Array(SCANLINE_COUNT)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.9}
          x={`${10 + i * 10}%`}
          duration={3 + (i % 3)}
        />
      ))}

      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-cyan-400/60" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-cyan-400/60" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-cyan-400/60" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-cyan-400/60" />

      {/* Live hex counter top-right */}
      <motion.div
        className="absolute top-8 right-20 font-mono text-[9px] text-cyan-400/50 tracking-widest"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        0x{hexTick}
      </motion.div>

      {/* Status dot top-left */}
      <div className="absolute top-8 left-20 flex items-center gap-1.5">
        <motion.div
          className="w-2 h-2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <span className="font-mono text-[9px] tracking-widest text-red-400/70">ERR_NODE_DOWN</span>
      </div>

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm bg-black/85 backdrop-blur-md clip-scifi-panel holo-border px-7 pt-14 pb-10"
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full h-8 bg-black/50 border-b border-cyan-400/20 flex items-center justify-between px-4">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/40" />
            <div className="w-2 h-2 rounded-full bg-cyan-400/20" />
          </div>
          <span className="font-mono text-[9px] tracking-widest text-cyan-400/60">
            MAINTENANCE_MODE // v2.7
          </span>
        </div>

        {/* Diagonal cyber lines decoration */}
        <div className="absolute top-10 left-7 w-28 h-2 cyber-lines opacity-60" />

        {/* Skull / warning icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ filter: ["drop-shadow(0 0 8px #00F2FE)", "drop-shadow(0 0 20px #FF00FF)", "drop-shadow(0 0 8px #00F2FE)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl select-none"
          >
            ⚠
          </motion.div>
        </div>

        {/* Glitch title */}
        <motion.h1
          className="text-4xl font-mono font-black tracking-tighter text-center mb-1 glitch text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400"
          data-text={title}
          style={{ WebkitTextStroke: "1px transparent" }}
        >
          {title}
        </motion.h1>

        {/* Sub-title */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center font-mono text-[11px] tracking-widest text-fuchsia-400/80 mb-8"
        >
          UNDERGOING SCHEDULED MAINTENANCE
        </motion.p>

        {/* Progress bars */}
        <div className="space-y-3 mb-8">
          <ProgressBar label="CORE_SYSTEMS" value={73} color="#00F2FE" />
          <ProgressBar label="NEURAL_NET" value={48} color="#FF00FF" />
          <ProgressBar label="ZK_NODES" value={91} color="#FBBF24" />
        </div>

        {/* Status messages */}
        <div className="bg-black/60 border border-cyan-400/10 p-3 font-mono text-[9px] leading-5 text-cyan-400/60 mb-6 space-y-0.5 clip-cyber-md">
          {[
            "[INFO]  Patching quantum relay layer…",
            "[WARN]  Node cluster experiencing downtime",
            "[INFO]  ETA: CALCULATING…",
            `[SYS ]  UPTIME_COUNTER: ${String(tick).padStart(5, "0")}s`,
          ].map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.18 }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        {/* Bottom status badges */}
        <div className="flex items-center justify-between border-t border-cyan-400/15 pt-4">
          <motion.div
            className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-400/50 tracking-widest"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-ping" />
            STAND BY
          </motion.div>
          <span className="font-mono text-[9px] text-fuchsia-400/50 tracking-widest">
            EVO_AEGIS // 27
          </span>
        </div>
      </motion.div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48">
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <p className="text-center font-mono text-[8px] mt-1 tracking-widest text-cyan-400/30">
          SECURE LINK // ENCRYPTED
        </p>
      </div>
    </div>
  );
};

export default UnderMaintenance;
