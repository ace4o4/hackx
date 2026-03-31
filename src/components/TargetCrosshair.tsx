import { motion } from "framer-motion";

interface TargetCrosshairProps {
  size?: number;
  color?: string;
  spinning?: boolean;
}

export default function TargetCrosshair({
  size = 64,
  color = "hsl(var(--primary))",
  spinning = true
}: TargetCrosshairProps) {
  const rotation = spinning ? { rotate: 360 } : { rotate: 0 };
  const transition = spinning 
    ? { duration: 15, repeat: Infinity, ease: "linear" as const } 
    : { duration: 0 };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Reticle Circle */}
      <motion.div 
        className="absolute inset-2 rounded-full border border-dashed opacity-60"
        style={{ borderColor: color }}
        animate={rotation}
        transition={transition}
      />
      
      {/* Center Dot */}
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, filter: `drop-shadow(0 0 6px ${color})` }} />

      {/* Target Crosses */}
      <div className="absolute top-0 left-1/2 -ml-[1px] w-[2px] h-[20%] bg-gradient-to-b from-transparent" style={{ '--tw-gradient-to': color } as React.CSSProperties} />
      <div className="absolute bottom-0 left-1/2 -ml-[1px] w-[2px] h-[20%] bg-gradient-to-t from-transparent" style={{ '--tw-gradient-to': color } as React.CSSProperties} />
      <div className="absolute left-0 top-1/2 -mt-[1px] h-[2px] w-[20%] bg-gradient-to-r from-transparent" style={{ '--tw-gradient-to': color } as React.CSSProperties} />
      <div className="absolute right-0 top-1/2 -mt-[1px] h-[2px] w-[20%] bg-gradient-to-l from-transparent" style={{ '--tw-gradient-to': color } as React.CSSProperties} />
      
      {/* Corner Brackets */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />
      </div>
    </div>
  );
}
