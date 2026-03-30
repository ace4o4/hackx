import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
  
const BOOT_LOGS = [
  "BIOS DATE 04/17/27 19:42:11 VER 2.01",
  "CPU: NEURAL_NEXUS Core(tm) i11-7900K @ 4.80GHz",
  "Memory Test: 4194304K OK",
  "Initializing DARSOB 27// Subsystems...",
  "Loading ZK-Sync Protocols... OK",
  "Mounting Secure Vault... OK",
  "Establishing Peer-to-Peer Relay...",
  "Bypassing node security protocols... [ACCESS GRANTED]",
  "Swarm Hub Initialized. Ready for uplink."
];

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<"boot" | "exit">("boot");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_LOGS.length) {
        setLogs((prev) => [...prev, BOOT_LOGS[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("exit"), 800);
      }
    }, 150);

    const finishTimeout = setTimeout(onComplete, 2800);
    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 z-[9999] bg-black text-primary font-mono overflow-hidden flex flex-col p-6"
        >
          {/* Glitch Overlay & Scanline */}
          <div className="glitch-overlay opacity-30"></div>
          <div className="cyber-scanline"></div>

          {/* Top terminal bracket */}
          <div className="w-full border-t border-l border-r border-primary/40 h-4 mb-4 relative">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary"></div>
          </div>

          {/* Logs Output */}
          <div className="flex-1 flex flex-col justify-end pb-8">
            <div className="space-y-1">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] md:text-sm tracking-widest uppercase text-shadow-glow"
                  style={{ textShadow: "0 0 5px rgba(57,255,20,0.5)" }}
                >
                  <span className="opacity-50 mr-2">&gt;</span>
                  {log}
                </motion.div>
              ))}
              {logs.length < BOOT_LOGS.length && (
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2.5 h-4 bg-primary mt-1"
                />
              )}
            </div>
          </div>

          {/* Big Header Center (appears at end) */}
          <AnimatePresence>
            {logs.length === BOOT_LOGS.length && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                className="absolute inset-0 flex items-center justify-center mix-blend-screen pointer-events-none"
              >
                <div className="border-t border-b border-primary/50 py-4 px-12 glass-surface clip-cyber bg-black">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-[0.2em] glitch text-primary" data-text="EVO_AEGIS">
                    EVO_AEGIS
                  </h1>
                  <p className="text-center text-[10px] tracking-[0.5em] mt-2 opacity-80">SYS.ON // DARSOB_27</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom terminal bracket */}
          <div className="w-full border-b border-l border-r border-primary/40 h-4 mt-4 relative">
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary"></div>
            <div className="absolute -bottom-4 right-2 text-[8px] opacity-50">v2.01.294 // NEURAL_LINK</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;

