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
    base: "bg-primary text-black border-2 border-primary clip-cyber-md",
    hover: "hover:bg-black hover:text-primary",
    glow: "0 0 15px hsl(var(--primary)/0.4)",
  },
  secondary: {
    base: "bg-secondary/50 text-primary border border-primary/30 clip-cyber-md border-tech",
    hover: "hover:bg-primary/20",
    glow: "none",
  },
  ghost: {
    base: "bg-transparent text-primary/80 hover:text-primary border border-transparent",
    hover: "hover:bg-primary/10 hover:border-primary/30",
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
      whileTap={!disabled && !isProcessing ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`
        relative overflow-hidden px-6 py-3 font-mono text-sm tracking-[0.2em] font-bold uppercase
        flex items-center justify-center gap-3 cursor-pointer
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${styles.base} ${styles.hover} ${className}
      `}
      style={{ boxShadow: !disabled ? styles.glow : "none" }}
    >
      {/* Cyberpunk Scanline Effect during processing */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "200%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-4 z-0"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(57, 255, 20, 0.3), transparent)",
              boxShadow: "0 0 10px rgba(57,255,20,0.5)"
            }}
          />
        )}
      </AnimatePresence>

      <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-current opacity-30"></div>
      <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-current opacity-30"></div>

      {/* Content with transitions */}
      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2 relative z-10"
          >
            <Check className="w-4 h-4" />
            <span>[ EXECUTED ]</span>
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 relative z-10"
          >
            <div className="flex gap-1">
               <motion.div className="w-1.5 h-1.5 bg-current" animate={{ opacity: [1,0,1] }} transition={{duration:0.6, repeat: Infinity}} />
               <motion.div className="w-1.5 h-1.5 bg-current" animate={{ opacity: [1,0,1] }} transition={{delay:0.2, duration:0.6, repeat: Infinity}} />
               <motion.div className="w-1.5 h-1.5 bg-current" animate={{ opacity: [1,0,1] }} transition={{delay:0.4, duration:0.6, repeat: Infinity}} />
            </div>
            <span>SYS.AWAIT</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 relative z-10"
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
