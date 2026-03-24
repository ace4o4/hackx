import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassZoneProps {
  children: ReactNode;
  className?: string;
  glow?: boolean | "cyan" | "amber" | "violet";
  delay?: number;
}

const GlassZone = ({ children, className = "", glow = false, delay = 0 }: GlassZoneProps) => {
  const glowClass = glow === true || glow === "cyan" ? "glow-cyan" : glow === "amber" ? "glow-amber" : glow === "violet" ? "glow-violet" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`glass-surface ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassZone;
