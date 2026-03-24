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

/* ─── Particle Burst ─── */
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
        className="absolute rounded-full"
        style={{
          width: p.size * scale,
          height: p.size * scale,
          background: p.color,
          boxShadow: `0 0 ${p.size * 2 * scale}px ${p.color}`,
          left: "50%",
          top: "50%",
        }}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        animate={{
          x: Math.cos(p.angle) * p.speed * scale,
          y: Math.sin(p.angle) * p.speed * scale,
          opacity: 0,
          scale: 0.3,
        }}
        transition={{ duration: p.life, ease: "easeOut" }}
      />
    ))}
  </div>
);

/* ─── Orbiting Dot ─── */
const OrbitDot = ({
  angle, radius, dotSize, color, speed, delay,
}: {
  angle: number; radius: number; dotSize: number; color: string; speed: number; delay: number;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: dotSize, height: dotSize,
      background: color,
      boxShadow: `0 0 ${dotSize * 2}px ${color}, 0 0 ${dotSize * 4}px ${color}50`,
      top: "50%", left: "50%",
    }}
    animate={{
      x: [
        Math.cos((angle * Math.PI) / 180) * radius - dotSize / 2,
        Math.cos(((angle + 360) * Math.PI) / 180) * radius - dotSize / 2,
      ],
      y: [
        Math.sin((angle * Math.PI) / 180) * radius - dotSize / 2,
        Math.sin(((angle + 360) * Math.PI) / 180) * radius - dotSize / 2,
      ],
    }}
    transition={{ duration: speed, delay, repeat: Infinity, ease: "linear" }}
  />
);

/* ─── The Evo Twin ─── */
const EvoTwin = ({
  level = 7, size = 200, className = "", mood = "idle",
  label, sublabel, interactive = false, onMoodChange,
}: EvoTwinProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blinkState, setBlinkState] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [currentMood, setCurrentMood] = useState<MoodType>(mood);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [moodIndex, setMoodIndex] = useState(0);

  const scale = size / 200;
  const normalizedLevel = Math.min(level, 99) / 99;

  const accentColor = useMemo(() => {
    if (normalizedLevel < 0.33) return "#00E6DC";
    if (normalizedLevel < 0.66) return "#A050FF";
    return "#FFB432";
  }, [normalizedLevel]);

  const secondaryColor = useMemo(() => {
    if (normalizedLevel < 0.33) return "#00B4FF";
    if (normalizedLevel < 0.66) return "#7C5CFF";
    return "#FF7849";
  }, [normalizedLevel]);

  // Blink
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 120);
    };
    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.7) setTimeout(blink, 280);
    }, 2800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

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

    // Spawn particles
    const colors = [accentColor, secondaryColor, "#FFB432", "#FF7849", "#00B4FF"];
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 0, y: 0,
      angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      speed: 40 + Math.random() * 50,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0.4 + Math.random() * 0.4,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  }, [interactive, moodIndex, accentColor, secondaryColor, onMoodChange]);

  // Pupil tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width * 1.5);
    const dy = (e.clientY - cy) / (rect.height * 1.5);
    const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));
    setPupilOffset({ x: clamp(dx, 0.3), y: clamp(dy, 0.3) });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const sphereSize = size * 0.65;
  const eyeWidth = 10 * scale;
  const eyeHeight = 26 * scale;
  const eyeGap = 22 * scale;
  const eyeRadius = 6 * scale;

  const getEyeShape = (isLeft: boolean) => {
    const base = {
      width: eyeWidth,
      height: blinkState ? 3 * scale : eyeHeight,
      borderRadius: blinkState ? `${eyeRadius * 2}px` : `${eyeRadius}px`,
      opacity: 1, rotate: 0, scaleX: 1,
      scaleY: blinkState ? 0.1 : 1, y: 0,
    };
    switch (currentMood) {
      case "happy":
        return { ...base, height: blinkState ? 3 * scale : eyeHeight * 0.7, borderRadius: blinkState ? `${eyeRadius * 2}px` : `${eyeRadius}px ${eyeRadius}px ${eyeRadius * 2}px ${eyeRadius * 2}px`, scaleY: blinkState ? 0.1 : 0.8, y: 2 * scale };
      case "curious":
        return { ...base, height: blinkState ? 3 * scale : isLeft ? eyeHeight * 1.2 : eyeHeight * 0.8, scaleY: blinkState ? 0.1 : isLeft ? 1.15 : 0.85, rotate: isLeft ? -5 : 5 };
      case "sleepy":
        return { ...base, height: blinkState ? 2 * scale : eyeHeight * 0.35, borderRadius: `${eyeRadius * 2}px`, scaleY: blinkState ? 0.1 : 0.4, y: 3 * scale };
      case "excited":
        return { ...base, height: blinkState ? 3 * scale : eyeHeight * 1.15, scaleX: 1.15, scaleY: blinkState ? 0.1 : 1.15 };
      case "thinking":
        return { ...base, height: blinkState ? 3 * scale : eyeHeight * 0.85, scaleY: blinkState ? 0.1 : 0.9, y: isLeft ? -3 * scale : 3 * scale, rotate: isLeft ? -8 : 0 };
      case "surprised":
        return { ...base, width: eyeWidth * 1.3, height: blinkState ? 3 * scale : eyeHeight * 1.3, borderRadius: `${eyeRadius * 1.5}px`, scaleY: blinkState ? 0.1 : 1.25, scaleX: 1.25 };
      default: return base;
    }
  };

  const getMouth = () => {
    const mouthY = sphereSize * 0.58;
    const baseStyle: React.CSSProperties = {
      position: "absolute", left: "50%", transform: "translateX(-50%)", top: mouthY,
      transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
    };
    switch (currentMood) {
      case "happy": case "excited":
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...baseStyle, width: 16 * scale, height: 8 * scale, borderBottom: `${2 * scale}px solid ${accentColor}80`, borderLeft: `${1.5 * scale}px solid transparent`, borderRight: `${1.5 * scale}px solid transparent`, borderRadius: `0 0 ${10 * scale}px ${10 * scale}px`, filter: `drop-shadow(0 0 ${4 * scale}px ${accentColor}40)` }} />;
      case "curious": case "surprised":
        return <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ ...baseStyle, width: 6 * scale, height: 7 * scale, border: `${1.5 * scale}px solid ${accentColor}60`, borderRadius: "50%", filter: `drop-shadow(0 0 ${3 * scale}px ${accentColor}30)` }} />;
      case "sleepy":
        return <div style={{ ...baseStyle, width: 10 * scale, height: 0, borderBottom: `${1.5 * scale}px solid ${accentColor}40`, borderRadius: `${6 * scale}px` }} />;
      case "thinking":
        return <div style={{ ...baseStyle, width: 10 * scale, height: 5 * scale, borderBottom: `${1.5 * scale}px solid ${accentColor}50`, borderRadius: `0 0 0 ${8 * scale}px`, transform: "translateX(-40%)" }} />;
      default:
        return <div style={{ ...baseStyle, width: 8 * scale, height: 0, borderBottom: `${1.5 * scale}px solid ${accentColor}35`, borderRadius: `${6 * scale}px` }} />;
    }
  };

  const showBlush = currentMood === "happy" || currentMood === "excited";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        className={`relative ${interactive ? "cursor-pointer" : ""}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        {/* Particles */}
        <AnimatePresence>
          {particles.length > 0 && <ParticleBurst particles={particles} scale={scale} />}
        </AnimatePresence>

        {/* Ambient glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: sphereSize * 1.4, height: sphereSize * 1.4,
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${accentColor}15, ${secondaryColor}08, transparent 70%)`,
            filter: `blur(${20 * scale}px)`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: sphereSize * 1.12, height: sphereSize * 1.12,
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            border: `1px solid ${accentColor}18`,
            boxShadow: `0 0 ${15 * scale}px ${accentColor}08, inset 0 0 ${15 * scale}px ${accentColor}05`,
          }}
        />

        {/* Main sphere */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: sphereSize, height: sphereSize,
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse 70% 60% at 35% 30%, rgba(60,65,90,0.5), rgba(20,22,35,0.95) 60%, rgba(8,10,20,1))`,
            boxShadow: `0 0 ${30 * scale}px ${accentColor}12, 0 ${8 * scale}px ${25 * scale}px rgba(0,0,0,0.6), inset 0 ${-4 * scale}px ${20 * scale}px rgba(0,0,0,0.5), inset 0 ${2 * scale}px ${8 * scale}px rgba(255,255,255,0.04)`,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          animate={{ y: [0, -3 * scale, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileTap={interactive ? { scale: 0.92 } : undefined}
        >
          {/* Glass highlight */}
          <div className="absolute rounded-full" style={{ width: "45%", height: "25%", top: "12%", left: "18%", background: "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)", borderRadius: "50%", filter: `blur(${4 * scale}px)` }} />

          {/* Eyes */}
          <div className="absolute flex items-center justify-center gap-0" style={{ top: "50%", left: "50%", transform: `translate(calc(-50% + ${pupilOffset.x * 4 * scale}px), calc(-50% + ${pupilOffset.y * 4 * scale}px - ${2 * scale}px))`, gap: eyeGap, transition: "transform 0.15s ease-out" }}>
            <motion.div animate={getEyeShape(true)} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }} style={{ width: getEyeShape(true).width, background: `linear-gradient(180deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 0 ${12 * scale}px ${accentColor}80, 0 0 ${25 * scale}px ${accentColor}30, inset 0 ${-2 * scale}px ${4 * scale}px ${accentColor}40`, borderRadius: getEyeShape(true).borderRadius }} />
            <motion.div animate={getEyeShape(false)} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }} style={{ width: getEyeShape(false).width, background: `linear-gradient(180deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 0 ${12 * scale}px ${accentColor}80, 0 0 ${25 * scale}px ${accentColor}30, inset 0 ${-2 * scale}px ${4 * scale}px ${accentColor}40`, borderRadius: getEyeShape(false).borderRadius }} />
          </div>

          <AnimatePresence mode="wait">{getMouth()}</AnimatePresence>

          {showBlush && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="absolute rounded-full" style={{ width: 14 * scale, height: 8 * scale, background: "radial-gradient(ellipse, rgba(255,100,140,0.35), transparent)", filter: `blur(${4 * scale}px)`, left: "15%", top: "55%" }} />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="absolute rounded-full" style={{ width: 14 * scale, height: 8 * scale, background: "radial-gradient(ellipse, rgba(255,100,140,0.35), transparent)", filter: `blur(${4 * scale}px)`, right: "15%", top: "55%" }} />
            </>
          )}
        </motion.div>

        {/* Orbiting dots */}
        <OrbitDot angle={0} radius={sphereSize * 0.62} dotSize={5 * scale} color={accentColor} speed={8} delay={0} />
        <OrbitDot angle={120} radius={sphereSize * 0.58} dotSize={4 * scale} color={secondaryColor} speed={10} delay={0.5} />
        <OrbitDot angle={240} radius={sphereSize * 0.65} dotSize={3.5 * scale} color={accentColor} speed={12} delay={1} />
        {normalizedLevel > 0.3 && <OrbitDot angle={60} radius={sphereSize * 0.7} dotSize={3 * scale} color={secondaryColor} speed={14} delay={2} />}
        {normalizedLevel > 0.6 && <OrbitDot angle={180} radius={sphereSize * 0.55} dotSize={3.5 * scale} color="#FFB432" speed={9} delay={1.5} />}

        {/* Interactive hint */}
        {interactive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, repeat: 3, delay: 1 }}
          >
            <p className="text-[8px] font-mono text-muted-foreground tracking-widest whitespace-nowrap">TAP ME</p>
          </motion.div>
        )}
      </div>

      {label && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center mt-2">
          <p className="text-sm font-mono font-bold text-foreground tracking-tight">{label}</p>
          {sublabel && <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: `${accentColor}90` }}>{sublabel}</p>}
        </motion.div>
      )}
    </div>
  );
};

export default EvoTwin;
