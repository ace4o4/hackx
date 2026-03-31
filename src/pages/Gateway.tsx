import { motion } from "framer-motion";
import EvoTwin from "@/components/EvoTwin";
import TargetCrosshair from "@/components/TargetCrosshair";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import ProcessingButton from "@/components/ProcessingButton";
import StatusBadge from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { playClick, playWhoosh } from "@/lib/sounds";

const Gateway = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    playClick();
    playWhoosh();
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-background cyber-grid bg-manga-dots text-foreground overflow-hidden">
      {/* Corner Crosshairs */}
      <div className="absolute top-8 left-8 w-6 h-6 border-l-2 border-t-2 border-primary/50"></div>
      <div className="absolute top-8 right-8 w-6 h-6 border-r-2 border-t-2 border-primary/50"></div>
      <div className="absolute bottom-8 left-8 w-6 h-6 border-l-2 border-b-2 border-primary/50"></div>
      <div className="absolute bottom-8 right-8 w-6 h-6 border-r-2 border-b-2 border-primary/50"></div>

      {/* Decorative Target */}
      <div className="absolute top-12 right-12 opacity-80">
        <TargetCrosshair size={64} color="hsl(var(--primary))" spinning={true} />
      </div>

      {/* Hex data stream - Matrix style */}
      <div className="absolute top-0 left-4 opacity-[0.1] font-mono text-[10px] leading-3 select-none pointer-events-none overflow-hidden h-full text-primary">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
          >
            {Math.random().toString(16).slice(2, 10).toUpperCase()}
          </motion.div>
        ))}
      </div>

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-black/80 backdrop-blur-md clip-scifi-panel pb-12 pt-16 px-8 holo-border"
      >
        {/* Top Decorative Bar */}
        <div className="absolute top-0 left-0 w-full h-8 bg-black/40 flex items-center px-4 justify-between border-b border-primary/20">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-primary">SYS.INIT // 27</span>
        </div>

        {/* Diagonal stripes decoration */}
        <div className="absolute top-12 left-8 w-32 h-2 cyber-lines opacity-50"></div>

        <div className="flex flex-col items-start text-left mt-8">
          <div className="w-full flex justify-center mb-8">
            <EvoTwin size={240} mood="thinking" interactive={true} />
          </div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
            className="text-5xl sm:text-6xl font-mono font-black tracking-tighter mb-2 glitch action-burst text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-success"
            data-text="EVO_AEGIS"
            style={{ WebkitTextStroke: "2px black" }}
          >
            EVO_AEGIS
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl font-mono tracking-widest text-primary mb-6 flex items-center gap-4"
          >
            27//
            <div className="h-px bg-primary/50 flex-grow"></div>
          </motion.h2>

          <div className="flex w-full justify-between items-start mb-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-xs text-muted-foreground font-mono leading-relaxed max-w-[200px]"
            >
              Train your personal AI twin through zero-knowledge micro-quests. Your data never leaves your phone.
            </motion.p>
            
            {/* Pseudo Barcode */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="flex items-end h-16 gap-0.5 opacity-80"
            >
              {[1,3,1,2,4,1,2,5,1,2,3,1,1,4].map((w, i) => (
                <div key={i} className="bg-foreground" style={{ width: `${w}px`, height: i%3===0 ? '100%' : '80%' }}></div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="w-full"
          >
            {/* The Processing Button wrapped in a cyberpunk container */}
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-primary/20 blur group-hover:bg-primary/40 transition duration-500"></div>
              <ProcessingButton variant="primary" onClick={handleNavigate} className="w-full font-mono tracking-widest relative z-10 bg-black hover:bg-black/90 text-primary border border-primary">
                INITIALIZE VIA PRIVY
              </ProcessingButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 flex items-center gap-3 w-full border-t border-primary/20 pt-4"
          >
            <StatusBadge label="ZK-FL v0.9.1" variant="neutral" pulse={false} />
            <StatusBadge label="NODES: 2,847" variant="active" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Lower Decorative Element */}
      <div className="absolute bottom-12 right-12 text-right">
        <p className="font-mono text-[8px] tracking-widest text-primary/60">SECURE LINK ESTABLISHED</p>
        <div className="w-32 h-px bg-primary/30 mt-1 ml-auto relative">
          <div className="absolute right-0 top-0 w-8 h-px bg-primary shadow-[0_0_8px_rgba(57,255,20,0.8)]"></div>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
