import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import EvoTwin from "@/components/EvoTwin";
import ProcessingButton from "@/components/ProcessingButton";
import { playClick, playWhoosh, playSuccess } from "@/lib/sounds";

const GenesisRoom = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "recording" | "synthesizing" | "complete">("idle");
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(32).fill(0.1));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "recording") return;
    const interval = setInterval(() => {
      setAudioLevels(prev => prev.map(() => 0.1 + Math.random() * 0.9));
    }, 80);
    const timeout = setTimeout(() => { playWhoosh(); setPhase("synthesizing"); }, 4000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "synthesizing") return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          playSuccess();
          setPhase("complete");
          return 100;
        }
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "complete") {
      const t = setTimeout(() => { playWhoosh(); navigate("/home"); }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase, navigate]);

  const synthLabel = useMemo(() => {
    if (progress < 30) return "Extracting vocal patterns...";
    if (progress < 60) return "Mapping neural baseline...";
    if (progress < 85) return "Calibrating twin resonance...";
    return "Synthesizing Neural Baseline...";
  }, [progress]);

  const handleStart = useCallback(() => {
    playClick();
    setPhase("recording");
  }, []);

  const twinMood = useMemo(() => {
    if (phase === "idle") return "curious" as const;
    if (phase === "recording") return "excited" as const;
    if (phase === "synthesizing") return "thinking" as const;
    return "happy" as const;
  }, [phase]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-background aurora-bg" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
      }} />

      <div className="absolute top-5 right-5 z-50">
        <DoodleThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tighter mb-3">
                <span className="gradient-text-aurora">GENESIS_ROOM</span>
              </h1>
              <p className="text-sm text-muted-foreground font-sans mb-8 max-w-xs leading-relaxed">
                Speak for a few seconds to create your Evo Twin's neural baseline.
              </p>
              <motion.div className="mb-6 cursor-pointer" onClick={handleStart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <EvoTwin size={160} level={1} mood="curious" />
              </motion.div>
              <div className="relative mb-6">
                <motion.div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), hsl(var(--primary)))" }} animate={{ rotate: 360, scale: [1, 1.08, 1] }} transition={{ rotate: { duration: 6, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} />
                <motion.button onClick={handleStart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative w-20 h-20 rounded-full bg-card flex items-center justify-center cursor-pointer m-[3px]">
                  <Mic className="w-7 h-7 text-primary" />
                </motion.button>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">TAP TWIN OR MIC TO BEGIN</p>
            </motion.div>
          )}

          {phase === "recording" && (
            <motion.div key="recording" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center">
              <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs font-mono text-primary tracking-widest mb-4">● RECORDING</motion.div>
              <EvoTwin size={120} level={2} mood="excited" className="mb-6" />
              <div className="relative w-56 h-56 mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {audioLevels.map((level, i) => {
                    const angle = (i / audioLevels.length) * Math.PI * 2 - Math.PI / 2;
                    const innerR = 55;
                    const outerR = innerR + level * 35;
                    const x1 = 100 + Math.cos(angle) * innerR;
                    const y1 = 100 + Math.sin(angle) * innerR;
                    const x2 = 100 + Math.cos(angle) * outerR;
                    const y2 = 100 + Math.sin(angle) * outerR;
                    const hue = 175 + (i / audioLevels.length) * 120;
                    return <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`hsl(${hue}, 80%, 60%)`} strokeWidth={2.5} strokeLinecap="round" initial={false} animate={{ x2, y2 }} transition={{ duration: 0.08 }} opacity={0.8} />;
                  })}
                  <circle cx="100" cy="100" r="8" fill="url(#coreGrad)" />
                  <defs><radialGradient id="coreGrad"><stop offset="0%" stopColor="hsl(175, 90%, 55%)" stopOpacity="0.9" /><stop offset="100%" stopColor="hsl(280, 70%, 60%)" stopOpacity="0.3" /></radialGradient></defs>
                </svg>
              </div>
              <p className="text-xs font-mono text-muted-foreground tracking-wider">SPEAK NATURALLY...</p>
            </motion.div>
          )}

          {phase === "synthesizing" && (
            <motion.div key="synthesizing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center w-full">
              <EvoTwin size={100} level={3} mood="thinking" className="mb-6" />
              <p className="text-sm font-mono text-foreground tracking-wider mb-2 gradient-text-aurora">{synthLabel}</p>
              <p className="text-xs font-mono text-muted-foreground mono-nums mb-6">{progress}%</p>
              <div className="w-full max-w-xs h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <EvoTwin size={140} level={5} mood="happy" className="mb-4" />
              <h2 className="text-xl font-mono font-bold tracking-tighter gradient-text-cyan">TWIN INITIALIZED</h2>
              <p className="text-xs font-mono text-muted-foreground mt-2 tracking-wider">REDIRECTING TO SWARM...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenesisRoom;
