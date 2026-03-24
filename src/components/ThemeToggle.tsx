import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
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

  // Init from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("evo-theme");
    if (saved === "light") setIsDark(false);
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsDark((p) => !p)}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full glass-surface border border-border/50 aegis-transition ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="w-4 h-4 text-primary" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? -180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="w-4 h-4 text-accent" />
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
