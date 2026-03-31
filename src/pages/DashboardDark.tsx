import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Lock, ChevronRight, ActivitySquare, Hash, ExternalLink, Wallet } from "lucide-react";
import TechDial from "@/components/TechDial";
import ScanningBar from "@/components/ScanningBar";
import TargetCrosshair from "@/components/TargetCrosshair";
import { useNavigate } from "react-router-dom";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import EvoTwin from "@/components/EvoTwin";
import { fetchRecentProofs } from "@/lib/ml";
import { connectWallet, deployContract, getContractAddress, shortenAddress, getWalletBalance, getContractExplorerUrl } from "@/lib/blockchain";

interface ZKProof {
  id: number;
  data_type: string;
  proof_hash: string;
  reward: string;
  tx_hash: string;
  created_at: string;
}

const DashboardDark = () => {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState<ZKProof[]>([]);
  const [networkEvents, setNetworkEvents] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [contractDeployed, setContractDeployed] = useState(!!getContractAddress());
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    fetchRecentProofs().then(setProofs);

    // Simulated Global Network Pulse
    const interval = setInterval(() => {
      const events = [
        "Peer verified ZK-Audio proof [0x7a...d9]",
        "New Block height #1,489,921 reached",
        "Evo-1X node synced to mainnet",
        "Reward disbursed: +0.0003 APT to Peer_82",
        "Quantum-Safe tunnel established",
        "Validation complete: Frame_4402"
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setNetworkEvents(prev => [randomEvent, ...prev].slice(0, 3));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full min-h-[100dvh] bg-[#030712] font-sans selection:bg-primary/30 overflow-y-auto overflow-x-hidden bg-manga-dots cyber-grid-dense">
      
      {/* 
        =======================================================================
        DYNAMIC AMBIENT AURAS (BEHIND EVERYTHING)
        =======================================================================
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
        {/* Abstract Noise Grain */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
        
        {/* LIVE NETWORK PULSE UI (Bottom Left Float) */}
        <div className="absolute bottom-[2%] left-[2%] z-50 pointer-events-auto h-[100px] w-[220px] hidden md:flex flex-col gap-2 overflow-hidden">
           <AnimatePresence>
             {networkEvents.map((ev, i) => (
                <motion.div 
                  key={ev + i} 
                  initial={{ opacity: 0, x: -10, y: 10 }} 
                  animate={{ opacity: 1, x: 0, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  className="bg-black/60 backdrop-blur-md border border-white/5 rounded-lg px-3 py-2 text-[9px] font-mono text-primary/80 flex items-center gap-2 whitespace-nowrap shadow-lg"
                >
                  <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                  {ev}
                </motion.div>
             ))}
           </AnimatePresence>
        </div>
        
        {/* Massive Ambient Spawns (Neon Dark Mode) */}
        <motion.div 
          className="absolute w-80 h-80 rounded-full opacity-40"
          style={{ background: "#00F2FE", filter: "blur(120px)", top: "-10%", right: "-10%" }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div 
          className="absolute w-96 h-96 rounded-full opacity-40"
          style={{ background: "#8B5CF6", filter: "blur(120px)", bottom: "5%", left: "-20%" }}
          animate={{ x: [0, 50, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute w-72 h-72 rounded-full opacity-30"
          style={{ background: "#FDE047", filter: "blur(100px)", top: "40%", right: "-10%" }}
          animate={{ x: [0, -20, 0], y: [0, -30, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {walletAddress ? (
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
            <Wallet className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="text-[10px] font-mono text-white/80">{shortenAddress(walletAddress)}</span>
            {walletBalance && <span className="text-[9px] font-mono text-white/40">{walletBalance} APT</span>}
          </div>
        ) : (
          <button
            onClick={async () => {
              try {
                const { address } = await connectWallet();
                setWalletAddress(address);
                const bal = await getWalletBalance(address);
                setWalletBalance(bal);
              } catch (e: unknown) {
                const error = e as Error;
                alert(error.message || "Wallet connection failed");
              }
            }}
            className="flex items-center gap-2 bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] rounded-full px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase hover:bg-[#00F2FE]/20 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" /> Connect
          </button>
        )}
        <DoodleThemeToggle />
      </div>

      {/* Deploy Contract Banner */}
      {walletAddress && !contractDeployed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[380px]"
        >
          <div className="bg-[#8B5CF6]/10 backdrop-blur-md border border-[#8B5CF6]/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-mono font-bold text-white uppercase tracking-wider mb-1">Deploy Smart Contract</p>
              <p className="text-[9px] font-mono text-white/50">One-time setup to enable real on-chain ZK-Proofs</p>
            </div>
            <button
              onClick={async () => {
                try {
                  setIsDeploying(true);
                  const { signer } = await connectWallet();
                  await deployContract(signer);
                  setContractDeployed(true);
                } catch (e: unknown) {
                  const error = e as Error;
                  console.error("Deploy failed:", error);
                  alert("Deploy failed: " + (error.message || "Unknown error"));
                } finally {
                  setIsDeploying(false);
                }
              }}
              disabled={isDeploying}
              className="shrink-0 bg-[#8B5CF6] text-white px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-[#7C3AED] transition-colors disabled:opacity-50"
            >
              {isDeploying ? "Deploying..." : "Deploy"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Contract deployed banner */}
      {walletAddress && contractDeployed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50"
        >
          <a
            href={getContractExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-[9px] font-mono text-green-400 hover:bg-green-500/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Contract Live on Aptos Testnet <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      )}

      {/* 
        =======================================================================
        THE ORGANIC TECH-SCULPTURE (Dark Theme)
        =======================================================================
      */}
      <main className="w-full h-full max-w-[412px] mx-auto flex flex-col items-center">

        {/* First Screen (Hero Section) */}
        <div className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center shrink-0 px-4">
          {/* SATELLITE BLOCKS... */}
        <motion.div 
          className="absolute top-[12%] left-0 w-[75%] bg-black/80 holo-border backdrop-blur-[40px] border border-primary/30 p-5 clip-scifi-panel shadow-[0_20px_40px_-10px_rgba(0,242,254,0.3)] z-20 flex items-center justify-between"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse shadow-[0_0_10px_#00F2FE]" />
              <span className="text-[10px] font-bold tracking-widest text-[#00F2FE] uppercase">Swarm Mesh</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none -ml-0.5">2,847</h2>
            <p className="text-[10px] font-medium text-zinc-400 mt-1 ml-1">Active Nodes</p>
          </div>
          <div className="shrink-0 drop-shadow-[0_0_15px_rgba(0,242,254,0.4)] relative right-4 max-sm:-right-2">
            <TechDial percentage={100} size={50} label="SYNC" color="#00F2FE" />
          </div>
        </motion.div>

        {/* 
          THE CORE CENTERPIECE: Evo Twin
        */}
        <div className="relative top-[2%] z-30 flex flex-col items-center justify-center p-8 mt-4">
           <EvoTwin size={300} mood="curious" interactive={true} />
        </div>

        {/* 
          BOTTOM RIGHT SATELLITE: Privacy Metrics
        */}
        <motion.div 
          className="absolute bottom-[28%] right-0 w-[65%] bg-black/80 holo-border backdrop-blur-[40px] border border-primary/30 p-5 clip-scifi-panel shadow-[0_20px_40px_-10px_rgba(253,224,71,0.2)] z-40 flex flex-col items-end text-right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="absolute top-4 left-4 opacity-80">
            <TargetCrosshair size={42} color="#FDE047" spinning={true} />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">ZK Secured</h3>
          <p className="text-[10px] text-zinc-400 font-medium leading-tight max-w-[120px] mt-1 mb-3">
            Local params encrypted. Only geometric proofs leave this device.
          </p>
          <div className="bg-black/40 px-3 py-1.5 rounded-full border border-white/10 flex gap-2 items-center">
             <span className="text-sm font-bold text-white font-mono">1,482</span>
             <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA] font-bold">Proofs</span>
          </div>
        </motion.div>

        {/* 
          BOTTOM LEFT SATELLITE: Intersecting Performance
        */}
        <motion.div 
          className="absolute bottom-[10%] left-6 z-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Intersection Base Rectangle */}
          <div className="relative bg-black/80 holo-border backdrop-blur-[40px] border border-primary/30 p-5 pr-12 clip-scifi-panel shadow-[0_15px_30px_-5px_rgba(236,72,153,0.3)] flex flex-col items-start pt-8 pb-5 mt-6 ml-4">
             <span className="text-[10px] uppercase tracking-wider text-[#EC4899] font-bold mb-1">Compute Cost</span>
             <span className="text-2xl font-black text-white font-mono leading-none">12.4%</span>
          </div>
          {/* Overlapping/Intersecting Circle */}
          <div className="absolute top-0 left-0 -translate-x-4 -translate-y-4 z-10 bg-[#09090B]/80 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.4)]">
             <TechDial percentage={12} size={70} label="LOAD" color="#EC4899" />
          </div>
        </motion.div>
        {/* 
          BOTTOM CENTER ACTION BALL
        */}
        <motion.button
            onClick={() => navigate("/quest")}
            className="absolute bottom-8 right-8 bg-black/80 text-primary border border-primary clip-scifi-button holo-border px-8 py-5 flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(0,242,254,0.3)] z-50 transition-transform hover:scale-105 active:scale-95 group overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
           <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
           <span className="font-bold tracking-widest text-primary uppercase text-[11px] relative z-10">Init Quest</span>
           <ChevronRight className="w-4 h-4 text-primary relative z-10 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        </div> {/* End Hero Section */}

        {/* 
          NETWORK LEDGER SECTION
        */}
        {proofs.length > 0 && (
          <motion.div
            className="w-full pb-10 px-4 z-30 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="bg-black/40 holo-border backdrop-blur-[40px] border border-primary/30 clip-scifi-panel p-5 shadow-[0_20px_40px_-10px_rgba(0,242,254,0.15)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#00F2FE]" />
                  <span className="text-[10px] font-bold tracking-widest text-[#00F2FE] uppercase">Network Ledger</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
                </div>
                <button
                  onClick={() => navigate('/explorer')}
                  className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-white/60 hover:text-white transition-colors uppercase"
                >
                  AethosScan <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Proof Cards */}
              <div className="space-y-2.5">
                {proofs.map((proof) => {
                  const age = Math.max(1, Math.floor((Date.now() - new Date(proof.created_at).getTime()) / 60000));
                  return (
                    <div key={proof.id} className="bg-black/30 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 group hover:border-[#00F2FE]/30 transition-colors">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-sm">
                        {proof.data_type === "audio" ? "🔊" : "👁️"}
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-[#00F2FE] truncate">{proof.tx_hash}</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5 font-mono uppercase">ZK-{proof.data_type} · {age}m ago</p>
                      </div>
                      {/* Reward */}
                      <span className="text-xs font-bold text-white font-mono shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                        +{proof.reward}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default DashboardDark;
