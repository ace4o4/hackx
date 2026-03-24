import { motion } from "framer-motion";
import { ReactNode } from "react";

interface QuestButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "amber" | "violet";
}

const gradients = {
  primary: "conic-gradient(from 0deg, #00E6DC, #00B4FF, #A050FF, #00E6DC)",
  amber: "conic-gradient(from 0deg, #FFB432, #FF7849, #FFB432)",
  violet: "conic-gradient(from 0deg, #A050FF, #7C5CFF, #00B4FF, #A050FF)",
};

const QuestButton = ({ children, onClick, className = "", variant = "primary" }: QuestButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`relative group cursor-pointer ${className}`}
    >
      {/* Spinning conic gradient border */}
      <div className="absolute -inset-[1.5px] rounded-xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: gradients[variant] }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Inner content */}
      <div className="relative rounded-xl bg-card/95 backdrop-blur-xl px-8 py-4 font-mono text-sm tracking-wider text-foreground flex items-center justify-center gap-3 aegis-transition group-hover:bg-card/80">
        {children}
      </div>
    </motion.button>
  );
};

export default QuestButton;
