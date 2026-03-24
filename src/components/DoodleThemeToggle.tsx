import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DoodleThemeToggle = ({ className = "" }: { className?: string }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return !document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("evo-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("evo-theme");
    if (saved === "light") setIsDark(false);
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 0.88, rotate: isDark ? -15 : 15 }}
      whileHover={{ scale: 1.08 }}
      onClick={() => setIsDark((p) => !p)}
      className={`relative w-14 h-7 rounded-full cursor-pointer ${className}`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, hsl(232 45% 14%), hsl(230 40% 20%))"
          : "linear-gradient(135deg, hsl(210 80% 80%), hsl(200 70% 88%))",
        border: isDark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
      aria-label="Toggle theme"
    >
      {/* Stars (dark mode) */}
      <motion.div
        animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
      >
        {[
          { x: 8, y: 5, s: 2 },
          { x: 12, y: 16, s: 1.5 },
          { x: 28, y: 8, s: 1.8 },
          { x: 34, y: 18, s: 1.2 },
          { x: 22, y: 4, s: 1 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: star.s,
              height: star.s,
              left: star.x,
              top: star.y,
              background: "white",
            }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Clouds (light mode) */}
      <motion.div
        animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
      >
        {[
          { x: 6, y: 14, w: 10, h: 5 },
          { x: 28, y: 16, w: 8, h: 4 },
        ].map((cloud, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: cloud.w,
              height: cloud.h,
              left: cloud.x,
              top: cloud.y,
              background: "rgba(255,255,255,0.7)",
              filter: "blur(1px)",
            }}
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
          />
        ))}
      </motion.div>

      {/* Toggle knob — Moon/Sun */}
      <motion.div
        animate={{ x: isDark ? 2 : 33 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[3px] w-[21px] h-[21px] rounded-full"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #E8E0D0, #C8BDA8)"
            : "linear-gradient(135deg, #FFD93D, #FF9E2C)",
          boxShadow: isDark
            ? "0 1px 6px rgba(0,0,0,0.3), inset -2px -1px 0 rgba(180,170,150,0.5)"
            : "0 2px 10px rgba(255,180,50,0.5), 0 0 20px rgba(255,200,80,0.3)",
        }}
      >
        {/* Moon craters (dark) */}
        <motion.div
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <div className="absolute w-[4px] h-[4px] rounded-full bg-[rgba(160,150,130,0.4)] top-[4px] left-[5px]" />
          <div className="absolute w-[3px] h-[3px] rounded-full bg-[rgba(160,150,130,0.3)] top-[11px] left-[10px]" />
          <div className="absolute w-[2px] h-[2px] rounded-full bg-[rgba(160,150,130,0.35)] top-[6px] left-[12px]" />
        </motion.div>

        {/* Sun rays (light) */}
        <motion.div
          animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? 0 : 360 }}
          transition={{ opacity: { duration: 0.2 }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
          className="absolute inset-[-4px]"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <div
              key={angle}
              className="absolute w-[1.5px] h-[3px] rounded-full"
              style={{
                background: "rgba(255,180,50,0.6)",
                top: "50%",
                left: "50%",
                transformOrigin: "center center",
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-12px)`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default DoodleThemeToggle;
