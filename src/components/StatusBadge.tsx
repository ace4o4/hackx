import { motion } from "framer-motion";

interface StatusBadgeProps {
  label: string;
  variant?: "active" | "pending" | "success" | "warning" | "neutral";
  pulse?: boolean;
  className?: string;
}

const variantConfig = {
  active: { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary" },
  pending: { bg: "bg-accent/15", text: "text-accent", dot: "bg-accent" },
  success: { bg: "bg-success/15", text: "text-success", dot: "bg-success" },
  warning: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
  neutral: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

const StatusBadge = ({ label, variant = "active", pulse = true, className = "" }: StatusBadgeProps) => {
  const config = variantConfig[variant];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase ${config.bg} ${config.text} ${className}`}
    >
      <motion.div
        className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
        animate={pulse ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : {}}
        transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      />
      {label}
    </div>
  );
};

export default StatusBadge;
