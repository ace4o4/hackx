import { motion } from "framer-motion";
import { Wifi, Lock, Sparkles, ChevronRight, ActivitySquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="relative h-full min-h-[100dvh] bg-[#F8F9FA] font-sans selection:bg-[#00F2FE]/30 overflow-hidden flex items-center justify-center">
      
      {/* 
        =======================================================================
        DYNAMIC AMBIENT AURAS (BEHIND EVERYTHING)
        =======================================================================
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Abstract Noise Grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
        
        {/* Massive Ambient Spawns */}
        <motion.div 
          className="absolute w-80 h-80 rounded-full mix-blend-multiply opacity-50"
          style={{ background: "#00F2FE", filter: "blur(100px)", top: "-10%", right: "-10%" }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div 
          className="absolute w-96 h-96 rounded-full mix-blend-multiply opacity-50"
          style={{ background: "#EC4899", filter: "blur(100px)", bottom: "10%", left: "-20%" }}
          animate={{ x: [0, 50, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute w-72 h-72 rounded-full mix-blend-multiply opacity-40"
          style={{ background: "#FDE047", filter: "blur(100px)", top: "40%", right: "-10%" }}
          animate={{ x: [0, -20, 0], y: [0, -30, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <DoodleThemeToggle />
      </div>

      {/* 
        =======================================================================
        THE ORGANIC TECH-SCULPTURE
        =======================================================================
      */}
      <main className="relative w-full h-full max-w-[412px] mx-auto px-4 flex flex-col items-center justify-center">

        {/* 
          TOP LEFT SATELLITE: Swarm Sync
          Asymmetrical sweeping pill extending off the edge
        */}
        <motion.div 
          className="absolute top-[12%] left-0 w-[75%] bg-white/40 backdrop-blur-[40px] border border-white/60 p-5 rounded-[20px_100px_100px_20px] shadow-[0_20px_40px_-10px_rgba(0,242,254,0.15)] z-20 flex items-center justify-between"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-[#0E7490] uppercase">Swarm Mesh</span>
            </div>
            <h2 className="text-3xl font-black text-[#030712] tracking-tighter leading-none -ml-0.5">2,847</h2>
            <p className="text-[10px] font-medium text-[#52525B] mt-1 ml-1">Active Nodes</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F2FE]/20 to-transparent flex items-center justify-center border border-[#00F2FE]/30 shrink-0">
            <Wifi className="w-5 h-5 text-[#0E7490]" />
          </div>
        </motion.div>

        {/* 
          THE CORE CENTERPIECE: Evo Twin
          Massive Perfect Circle
        */}
        <motion.div 
          className="relative top-[2%] z-30 w-64 h-64 sm:w-72 sm:h-72 bg-white/40 backdrop-blur-[60px] border border-white/80 rounded-full flex flex-col items-center justify-center p-8 shadow-[0_30px_60px_-15px_rgba(236,72,153,0.2)]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Inner pulsating core */}
          <motion.div 
            className="absolute inset-2 rounded-full border border-white/40"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="text-center mt-2">
            <h1 className="text-3xl font-black text-[#030712] tracking-tighter mix-blend-overlay">Evo-1X</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#9D174D] font-bold mt-1">Lvl 07 Sentinel</p>
          </div>

          {/* Abstract Synthesis Dial */}
          <div className="absolute bottom-10 inset-x-0 px-12 flex flex-col items-center">
             <span className="text-5xl font-mono font-black text-[#030712] tracking-tighter leading-none">84<span className="text-xl">%</span></span>
             <span className="text-[9px] uppercase tracking-widest text-[#52525B] mt-2 font-bold bg-white/50 px-2 py-0.5 rounded-full">Neural Synthesis</span>
          </div>
        </motion.div>

        {/* 
          BOTTOM RIGHT SATELLITE: Privacy Metrics
          Tear-drop shaped glass
        */}
        <motion.div 
          className="absolute bottom-[28%] right-0 w-[65%] bg-white/40 backdrop-blur-[40px] border border-white/60 p-5 rounded-[100px_20px_20px_100px] shadow-[0_20px_40px_-10px_rgba(253,224,71,0.2)] z-40 flex flex-col items-end text-right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FDE047]/30 to-transparent flex items-center justify-center border border-[#FDE047]/40 mb-3 absolute top-4 left-4">
            <Lock className="w-4 h-4 text-[#854D0E]" />
          </div>
          <h3 className="text-lg font-black text-[#030712] tracking-tight">ZK Secured</h3>
          <p className="text-[10px] text-[#52525B] font-medium leading-tight max-w-[120px] mt-1 mb-3">
            Local params encrypted. Only geometric proofs leave this device.
          </p>
          <div className="bg-white/50 px-3 py-1.5 rounded-full border border-white flex gap-2 items-center">
             <span className="text-sm font-bold text-[#030712] font-mono">1,482</span>
             <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA] font-bold">Proofs</span>
          </div>
        </motion.div>

        {/* 
          BOTTOM LEFT SATELLITE: Intersecting Performance
          Circle intersecting a rounded container
        */}
        <motion.div 
          className="absolute bottom-[10%] left-6 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Intersection Base Rectangle */}
          <div className="relative bg-white/40 backdrop-blur-[40px] border border-white/60 p-5 pr-12 rounded-[24px] shadow-[0_15px_30px_-5px_rgba(139,92,246,0.15)] flex flex-col items-start pt-8 pb-5 mt-6 ml-4">
             <span className="text-[10px] uppercase tracking-wider text-[#8B5CF6] font-bold mb-1">Compute Cost</span>
             <span className="text-2xl font-black text-[#030712] font-mono leading-none">12.4%</span>
          </div>
          {/* Overlapping/Intersecting Circle */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#FFFFFF] to-white/30 backdrop-blur-md border border-white flex items-center justify-center shadow-lg shadow-black/5 -translate-x-2 -translate-y-2 z-10">
             <ActivitySquare className="w-6 h-6 text-[#8B5CF6]" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* 
          BOTTOM CENTER ACTION BALL
          A sharp clip-path shard action button
        */}
        <motion.button
            onClick={() => navigate("/quest")}
            className="absolute bottom-[5%] right-6 bg-[#030712] text-white px-8 py-5 flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-50 transition-transform active:scale-95 group overflow-hidden"
            style={{ clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <span className="font-bold tracking-widest text-[#FDE047] uppercase text-[11px] relative z-10">Init Quest</span>
           <ChevronRight className="w-4 h-4 text-white relative z-10 group-hover:translate-x-1 transition-transform" />
        </motion.button>

      </main>
    </div>
  );
}
