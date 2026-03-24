import { motion } from "framer-motion";

interface StatWidgetProps {
  label: string;
  value: string;
  unit?: string;
  delay?: number;
  accent?: "cyan" | "amber" | "violet" | "success";
}

const accentColors: Record<string, string> = {
  cyan: "rgba(0,230,220,0.15)",
  amber: "rgba(255,180,50,0.15)",
  violet: "rgba(160,80,255,0.15)",
  success: "rgba(50,200,120,0.15)",
};

const StatWidget = ({ label, value, unit = "", delay = 0, accent = "cyan" }: StatWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="glass-surface p-5 group aegis-transition hover:scale-[1.02]"
      style={{
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 0 30px ${accentColors[accent]}`,
      }}
    >
      <p className="text-xs font-mono tracking-wider text-muted-foreground uppercase mb-3">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-mono font-bold tracking-tighter text-foreground mono-nums">{value}</span>
        {unit && <span className="text-xs font-mono text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
};

export default StatWidget;
