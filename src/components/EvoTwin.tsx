import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPop, haptic } from "@/lib/sounds";

interface EvoTwinProps {
  level?: number;
  size?: number;
  className?: string;
  mood?: "idle" | "happy" | "curious" | "sleepy" | "excited" | "thinking" | "surprised";
  label?: string;
  sublabel?: string;
  interactive?: boolean;
  onMoodChange?: (mood: string) => void;
}

type MoodType = EvoTwinProps["mood"];
const ALL_MOODS: MoodType[] = ["idle", "happy", "curious", "sleepy", "excited", "thinking", "surprised"];

/* ─── Tech Particle Burst ─── */
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  life: number;
}

const ParticleBurst = ({ particles, scale }: { particles: Particle[]; scale: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-visible">
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute bg-primary"
        style={{
          width: p.size * scale,
          height: p.size * scale * 2, // rectangular cyber bits
          background: p.color,
          boxShadow: `0 0 ${p.size * scale}px ${p.color}`,
          left: "50%",
          top: "50%",
          clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0 80%)"
        }}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: p.angle * 180 / Math.PI }}
        animate={{
          x: Math.cos(p.angle) * p.speed * scale,
          y: Math.sin(p.angle) * p.speed * scale,
          opacity: 0,
          scale: 0.1,
        }}
        transition={{ duration: p.life, ease: "easeOut" }}
      />
    ))}
  </div>
);

/* ─── The Cyber Core EvoTwin ─── */
const EvoTwin = ({
  level = 7, size = 200, className = "", mood = "idle",
  label, sublabel, interactive = false, onMoodChange,
}: EvoTwinProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMood, setCurrentMood] = useState<MoodType>(mood);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [moodIndex, setMoodIndex] = useState(0);

  const scale = size / 200;
  const coreSize = size * 0.5;

  // Telemetry stream generator
  const [telemetry, setTelemetry] = useState("0x000");

  useEffect(() => {
    let speed = 500;
    if (currentMood === "excited" || currentMood === "happy") speed = 100;
    if (currentMood === "sleepy") speed = 1500;
    if (currentMood === "thinking") speed = 800;
    if (currentMood === "curious") speed = 300;

    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
      setTelemetry(currentMood === "sleepy" ? "Zzz..." : `0x${hex}`);
    }, speed);
    return () => clearInterval(interval);
  }, [currentMood]);

  // Mood from prop (non-interactive)
  useEffect(() => {
    if (interactive) return;
    if (mood !== "idle") {
      setCurrentMood(mood);
      return;
    }
    const moods: MoodType[] = ["idle", "happy", "curious", "thinking", "idle", "excited"];
    const interval = setInterval(() => {
      setCurrentMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [mood, interactive]);

  // Interactive click handler — cycle moods + burst particles
  const handleClick = useCallback(() => {
    if (!interactive) return;
    haptic("medium");
    playPop();

    const nextIdx = (moodIndex + 1) % ALL_MOODS.length;
    setMoodIndex(nextIdx);
    const newMood = ALL_MOODS[nextIdx];
    setCurrentMood(newMood);
    onMoodChange?.(newMood || "idle");

    // Spawn cyber particles
    const newParticles: Particle[] = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: 0, y: 0,
      angle: (i / 16) * Math.PI * 2,
      speed: 60 + Math.random() * 80,
      size: 2 + Math.random() * 6,
      color: Math.random() > 0.5 ? "hsl(var(--primary))" : "#ffffff",
      life: 0.3 + Math.random() * 0.3,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  }, [interactive, moodIndex, onMoodChange]);

  const getCoreColor = () => {
    switch (currentMood) {
      case "excited": return "hsl(var(--destructive))";
      case "happy": return "hsl(var(--success))";
      case "sleepy": return "hsl(var(--muted-foreground))";
      case "thinking": return "hsl(var(--primary))";
      case "curious": return "#FFB432";
      case "surprised": return "#FF0055";
      default: return "hsl(var(--primary))";
    }
  };

  const getImageForMood = (m: MoodType) => {
    switch (m) {
      case 'surprised': case 'excited': return 'excited';
      case 'happy': return 'happy';
      case 'sleepy': return 'sleepy';
      case 'curious': case 'thinking': return 'thinking';
      default: return 'idle';
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        className={`relative ${interactive ? "cursor-pointer" : ""}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        <AnimatePresence>
          {particles.length > 0 && <ParticleBurst particles={particles} scale={scale} />}
        </AnimatePresence>

        {/* Ambient Tech Glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: coreSize * 2, height: coreSize * 2,
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${getCoreColor()}30, transparent 60%)`,
            filter: `blur(${10 * scale}px)`,
          }}
          animate={{ scale: currentMood === "excited" ? [1, 1.2, 1] : [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: currentMood === "excited" ? 1 : 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer Tech Ring 1 */}
        <motion.div
          className="absolute border border-primary/20 rounded-full"
          style={{
            width: size * 0.9, height: size * 0.9,
            top: "50%", left: "50%", x: "-50%", y: "-50%",
            borderStyle: "dashed",
            borderWidth: `${2 * scale}px`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Outer Tech Ring 2 */}
        <motion.div
          className="absolute border-2 border-primary/40 rounded-full clip-cyber-tl-br"
          style={{
            width: size * 0.7, height: size * 0.7,
            top: "50%", left: "50%", x: "-50%", y: "-50%"
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Realistic Avatar Core */}
        <motion.div
          className="absolute bg-black flex items-center justify-center overflow-hidden clip-hex border-2 border-primary/50"
          style={{
            width: coreSize * 1.4, height: coreSize * 1.4,
            top: "50%", left: "50%", x: "-50%", y: "-50%",
            boxShadow: `0 0 ${20 * scale}px ${getCoreColor()}60, inset 0 0 ${30 * scale}px ${getCoreColor()}40`,
          }}
          animate={{
            scale: currentMood === "excited" ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        >
          {/* The Realistic Image */}
          <motion.img 
            key={currentMood}
            src={`/anime_twin_${getImageForMood(currentMood)}.png`} 
            alt={`Evo Twin ${currentMood}`} 
            className="w-full h-full object-cover opacity-90 mix-blend-screen action-burst"
            style={{ filter: `drop-shadow(0 0 10px ${getCoreColor()})` }}
            initial={{ filter: "brightness(2) contrast(1.5)" }}
            animate={{ 
              opacity: currentMood === "sleepy" ? 0.7 : 1,
              filter: `brightness(1) contrast(1)`
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Glitch/Hologram Overlay depending on mood */}
          {currentMood === "excited" && (
             <div className="absolute inset-0 bg-primary/20 mix-blend-overlay animate-pulse" />
          )}
          {currentMood === "thinking" && (
             <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay cyber-lines" />
          )}

          {/* Inner Matrix Scan */}
          <motion.div 
             className="absolute inset-0 bg-primary/10"
             animate={{ y: ["-100%", "100%"] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Telemetry overlay */}
          <div className="absolute bottom-2 inset-x-0 z-10 flex flex-col items-center">
             <span className="text-[10px] font-mono font-black text-white bg-black/50 px-2 rounded clip-scifi-tab" style={{ color: getCoreColor(), textShadow: `0 0 5px ${getCoreColor()}` }}>
               {telemetry}
             </span>
             {currentMood === "curious" && <span className="text-[8px] text-primary mt-1 animate-pulse bg-black/40 px-1 rounded">SCANNING</span>}
             {currentMood === "excited" && <span className="text-[8px] text-red-500 mt-1 font-bold bg-black/40 px-1 rounded">OVERRIDE</span>}
          </div>
        </motion.div>

        {/* Orbiting Tech Nodes */}
        {[0, 90, 180, 270].map((angle, i) => (
           <motion.div
             key={i}
             className="absolute w-2 h-2 bg-primary clip-cyber"
             style={{ top: "50%", left: "50%" }}
             animate={{
               x: [
                 Math.cos((angle * Math.PI) / 180) * (size * 0.45) - 4,
                 Math.cos(((angle + 360) * Math.PI) / 180) * (size * 0.45) - 4,
               ],
               y: [
                 Math.sin((angle * Math.PI) / 180) * (size * 0.45) - 4,
                 Math.sin(((angle + 360) * Math.PI) / 180) * (size * 0.45) - 4,
               ],
             }}
             transition={{ duration: Math.random() > 0.5 ? 4 : 6, delay: i * 0.5, repeat: Infinity, ease: "linear" }}
           />
        ))}

        {interactive && (
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black px-2 border border-primary/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <p className="text-[7px] font-mono text-primary tracking-widest whitespace-nowrap uppercase">INIT_LINK // TAP</p>
          </motion.div>
        )}
      </div>

      {label && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center mt-4 border border-x-primary/40 border-y-transparent px-6">
          <p className="text-sm font-mono font-bold text-foreground tracking-[0.2em]">{label.toUpperCase()}</p>
          {sublabel && <p className="text-[9px] font-mono tracking-widest text-primary/70">{sublabel}</p>}
        </motion.div>
      )}
    </div>
  );
};

export default EvoTwin;
