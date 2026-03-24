import { motion } from "framer-motion";

const NeuralOrb = ({ size = 300, className = "" }: { size?: number; className?: string }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer aurora glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,230,220,0.18) 0%, rgba(160,80,255,0.08) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Amber ring */}
      <motion.div
        className="absolute inset-[10%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,180,50,0.1) 0%, transparent 60%)",
        }}
        animate={{ scale: [1.1, 0.92, 1.1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Core orb - vibrant gradient */}
      <motion.div
        className="absolute inset-[22%] rounded-full"
        style={{
          background: "radial-gradient(circle at 38% 32%, rgba(0,230,220,0.6) 0%, rgba(160,80,255,0.35) 45%, rgba(255,180,50,0.15) 80%, transparent 100%)",
          boxShadow: "0 0 50px rgba(0,230,220,0.25), 0 0 100px rgba(160,80,255,0.1), inset 0 0 30px rgba(0,230,220,0.15)",
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute inset-[38%] rounded-full"
        style={{
          background: "radial-gradient(circle at 45% 40%, rgba(0,230,220,0.9) 0%, rgba(0,180,255,0.4) 50%, transparent 100%)",
          filter: "blur(3px)",
        }}
        animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles - multicolor */}
      {[...Array(8)].map((_, i) => {
        const colors = ["rgba(0,230,220,0.7)", "rgba(160,80,255,0.7)", "rgba(255,180,50,0.7)", "rgba(0,180,255,0.7)"];
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${25 + Math.random() * 50}%`,
              top: `${25 + Math.random() * 50}%`,
              backgroundColor: colors[i % colors.length],
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 50, 0],
              y: [0, (Math.random() - 0.5) * 50, 0],
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default NeuralOrb;
