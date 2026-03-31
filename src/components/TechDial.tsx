import { motion } from "framer-motion";

interface TechDialProps {
  percentage: number;
  size?: number;
  label?: string;
  color?: string;
}

export default function TechDial({ 
  percentage, 
  size = 100, 
  label = "DATA",
  color = "hsl(var(--primary))"
}: TechDialProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Rotating Dashes */}
      <motion.div 
        className="absolute inset-0 rounded-full border border-dashed opacity-50"
        style={{ borderColor: color, borderWidth: strokeWidth / 2 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Background Track */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${color}33`}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Value */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      
      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-center">
        <span className="text-[10px] tracking-widest opacity-70" style={{ color }}>{label}</span>
        <span className="font-bold tracking-tighter" style={{ fontSize: size * 0.22, color }}>{percentage}%</span>
      </div>
    </div>
  );
}
