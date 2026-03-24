import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";

interface ProcessingButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  processing?: boolean;
  success?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  autoReset?: boolean;
}

const variantStyles = {
  primary: {
    base: "bg-primary text-primary-foreground",
    hover: "hover:brightness-110",
    glow: "0 0 20px hsl(var(--primary) / 0.3), 0 4px 15px hsl(var(--primary) / 0.15)",
  },
  secondary: {
    base: "bg-secondary text-secondary-foreground",
    hover: "hover:brightness-110",
    glow: "0 0 20px hsl(var(--secondary) / 0.3), 0 4px 15px hsl(var(--secondary) / 0.15)",
  },
  ghost: {
    base: "glass-surface text-foreground",
    hover: "hover:brightness-110",
    glow: "none",
  },
};

const ProcessingButton = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  processing: externalProcessing,
  success: externalSuccess,
  disabled = false,
  icon,
  autoReset = true,
}: ProcessingButtonProps) => {
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);

  const isProcessing = externalProcessing ?? internalProcessing;
  const isSuccess = externalSuccess ?? internalSuccess;
  const styles = variantStyles[variant];

  useEffect(() => {
    if (internalSuccess && autoReset) {
      const t = setTimeout(() => setInternalSuccess(false), 2000);
      return () => clearTimeout(t);
    }
  }, [internalSuccess, autoReset]);

  const handleClick = async () => {
    if (isProcessing || isSuccess || disabled) return;
    if (onClick) {
      setInternalProcessing(true);
      try {
        await onClick();
        setInternalSuccess(true);
      } catch {
        /* allow external error handling */
      } finally {
        setInternalProcessing(false);
      }
    }
  };

  return (
    <motion.button
      whileHover={!disabled && !isProcessing ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isProcessing ? { scale: 0.97 } : {}}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`
        relative overflow-hidden rounded-xl px-6 py-3 font-mono text-sm tracking-wider
        flex items-center justify-center gap-2.5 cursor-pointer
        aegis-transition disabled:opacity-50 disabled:cursor-not-allowed
        ${styles.base} ${styles.hover} ${className}
      `}
      style={{ boxShadow: !disabled ? styles.glow : "none" }}
    >
      {/* Shimmer effect during processing */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/3"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Content with transitions */}
      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>DONE</span>
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>PROCESSING...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {icon}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ProcessingButton;
