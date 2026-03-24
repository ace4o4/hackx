import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "gradient";
  glow?: "cyan" | "violet" | "amber" | "none";
  delay?: number;
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

const glowStyles = {
  cyan: "0 0 25px hsl(var(--primary) / 0.12), inset 0 0 40px hsl(var(--primary) / 0.04)",
  violet: "0 0 25px hsl(var(--secondary) / 0.12), inset 0 0 40px hsl(var(--secondary) / 0.04)",
  amber: "0 0 25px hsl(var(--accent) / 0.12), inset 0 0 40px hsl(var(--accent) / 0.04)",
  none: "",
};

const PremiumCard = ({
  children,
  className = "",
  variant = "default",
  glow = "none",
  delay = 0,
  hoverable = true,
  header,
  footer,
}: PremiumCardProps) => {
  const isGradient = variant === "gradient";
  const isOutlined = variant === "outlined";
  const isElevated = variant === "elevated";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`
        relative rounded-2xl overflow-hidden
        ${hoverable ? "aegis-transition hover:scale-[1.015] hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {/* Gradient border for gradient variant */}
      {isGradient && (
        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), hsl(var(--primary)))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Main card body */}
      <div
        className={`
          relative rounded-2xl
          ${isElevated ? "glass-surface-elevated" : isOutlined ? "bg-card border border-border" : "glass-surface"}
        `}
        style={{ boxShadow: glowStyles[glow] }}
      >
        {/* Subtle top highlight line */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />

        {header && (
          <div className="px-5 pt-5 pb-0">
            {header}
            <div className="mt-3 h-[1px] bg-border/50" />
          </div>
        )}

        <div className="p-5">{children}</div>

        {footer && (
          <>
            <div className="mx-5 h-[1px] bg-border/50" />
            <div className="px-5 py-4">{footer}</div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumCard;
