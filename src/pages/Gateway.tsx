import { motion } from "framer-motion";
import EvoTwin from "@/components/EvoTwin";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import ProcessingButton from "@/components/ProcessingButton";
import StatusBadge from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { playClick, playWhoosh } from "@/lib/sounds";

const Gateway = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    playClick();
    playWhoosh();
    navigate("/genesis");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-background aurora-bg" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 45%, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.04) 40%, transparent 70%)",
      }} />

      {/* Doodle decorations (light mode only) */}
      <div className="absolute inset-0 pointer-events-none doodle-decorations opacity-0 light:opacity-100">
        <svg className="absolute top-10 left-10 w-16 h-16 text-muted-foreground/10" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
        <svg className="absolute bottom-20 right-16 w-12 h-12 text-muted-foreground/10" viewBox="0 0 40 40">
          <path d="M5 35 L20 5 L35 35 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        <svg className="absolute top-1/3 right-8 w-8 h-8 text-primary/15" viewBox="0 0 30 30">
          <path d="M15 2 L18 12 L28 12 L20 18 L23 28 L15 22 L7 28 L10 18 L2 12 L12 12 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-50">
        <DoodleThemeToggle />
      </div>

      {/* Hex data stream */}
      <div className="absolute top-0 left-8 opacity-[0.03] font-mono text-[10px] leading-4 select-none pointer-events-none overflow-hidden h-full">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 3, delay: i * 0.15, repeat: Infinity }}
          >
            {Math.random().toString(16).slice(2, 18).toUpperCase()}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <EvoTwin size={240} level={1} mood="curious" interactive label="Evo-1X" sublabel="INITIALIZATION" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-3xl sm:text-4xl font-mono font-bold tracking-tighter mb-4 mt-6"
        >
          <span className="gradient-text-aurora">JOIN THE GLOBAL</span>
          <br />
          <span className="text-foreground">INTELLIGENCE_</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-sm text-muted-foreground font-sans leading-relaxed mb-10 max-w-sm"
        >
          Train your personal AI twin through micro-quests. Earn rewards while contributing to the decentralized swarm intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <ProcessingButton variant="primary" onClick={handleNavigate}>
            INITIALIZE VIA PRIVY
          </ProcessingButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 flex items-center gap-4"
        >
          <StatusBadge label="ZK-FL v0.9.1" variant="neutral" pulse={false} />
          <StatusBadge label="NODES: 2,847" variant="active" />
          <StatusBadge label="14ms" variant="success" pulse={false} />
        </motion.div>
      </div>
    </div>
  );
};

export default Gateway;
