import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"orb" | "text" | "exit">("orb");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Ambient glow */}
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.15), transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Orb */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <motion.div
              className="w-24 h-24 rounded-full relative"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 35% 30%, rgba(60,65,90,0.5), rgba(20,22,35,0.95) 60%, rgba(8,10,20,1))",
                boxShadow: "0 0 40px hsl(var(--primary) / 0.2), 0 10px 30px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Eyes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] flex gap-[14px]">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
                  className="w-[6px] h-[16px] rounded-[4px]"
                  style={{
                    background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                    boxShadow: "0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3)",
                  }}
                />
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: "backOut" }}
                  className="w-[6px] h-[16px] rounded-[4px]"
                  style={{
                    background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                    boxShadow: "0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.3)",
                  }}
                />
              </div>

              {/* Glass highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "40%",
                  height: "20%",
                  top: "14%",
                  left: "20%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.07), transparent)",
                  filter: "blur(3px)",
                }}
              />

              {/* Orbiting particle */}
              <motion.div
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  x: [40, -40, 40],
                  y: [-30, 30, -30],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: phase === "text" ? 1 : 0, y: phase === "text" ? 0 : 15 }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h1 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora">
              EVO_AEGIS
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] mt-2">
              INITIALIZING SWARM
            </p>
          </motion.div>

          {/* Loading dots */}
          <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
