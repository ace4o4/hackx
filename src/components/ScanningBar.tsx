import { motion } from "framer-motion";

interface ScanningBarProps {
  progress: number;
  label?: string;
  color?: string;
  height?: number;
}

export default function ScanningBar({
  progress,
  label = "SCANNING",
  color = "hsl(var(--primary))",
  height = 24
}: ScanningBarProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex justify-between items-end font-mono text-[10px] tracking-widest" style={{ color }}>
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      {/* Outer Border */}
      <div 
        className="w-full relative overflow-hidden flex items-center p-[2px] border"
        style={{ height, borderColor: `${color}40` }}
      >
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, ${color} 2px, ${color} 4px)` 
          }}
        />
        
        {/* Progress Fill */}
        <motion.div
          className="h-full relative z-10"
          style={{ backgroundColor: color, filter: `drop-shadow(0 0 8px ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Scanning Line Animation */}
        <motion.div
          className="absolute top-0 bottom-0 w-2 z-20 pointer-events-none mix-blend-overlay opacity-50 bg-white"
          animate={{ left: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
