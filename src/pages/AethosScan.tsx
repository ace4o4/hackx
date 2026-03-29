import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Box, Hash, Activity, Shield, Coins, Search, ExternalLink } from "lucide-react";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import { playClick, playWhoosh } from "@/lib/sounds";
import { fetchRecentProofs } from "@/lib/ml";
import { getOnChainProofs, getOnChainProofCount, getContractAddress, getExplorerUrl, getContractExplorerUrl } from "@/lib/blockchain";

interface ZKProof {
  id: number;
  data_type: string;
  proof_hash: string;
  reward: string;
  tx_hash: string;
  created_at: string;
}

interface PendingTx {
  hash: string;
  type: string;
  reward: string;
  timestamp: number;
}

const AethosScan = () => {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState<ZKProof[]>([]);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [blockHeight, setBlockHeight] = useState(1489920);
  const [loading, setLoading] = useState(true);
  const [onChainCount, setOnChainCount] = useState(0);
  const isContractLive = !!getContractAddress();

  useEffect(() => {
    (async () => {
      const data = await fetchRecentProofs();
      setProofs(data);
      setLoading(false);

      // Also fetch real on-chain count if contract is deployed
      if (isContractLive) {
        const count = await getOnChainProofCount();
        setOnChainCount(count);
      }
    })();

    // Simulate Network Pulse (Real-time Blocks & Peers)
    const interval = setInterval(() => {
      setBlockHeight(h => h + 1);
      
          // Randomly simulate a peer transaction entering the Mempool
          if (Math.random() > 0.6) {
            const fakeTx = {
              hash: "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(""),
              type: Math.random() > 0.5 ? "audio" : "image",
              reward: "0.0003 APT",
              timestamp: Date.now()
            };
            setPendingTxs(prev => [fakeTx, ...prev].slice(0, 3));
          }
        }, 4500);

        return () => clearInterval(interval);
      }, [isContractLive]);

      const handleBack = () => {
        playClick();
        playWhoosh();
        navigate("/dashboard");
      };

      return (
        <div className="relative min-h-[100dvh] flex flex-col items-center bg-[#07090E] overflow-hidden px-4 py-8">
          {/* Immersive Cyberpunk Grid Background */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 10%, black, transparent)'
          }} />

          <div className="absolute top-5 right-5 z-50">
            <DoodleThemeToggle />
          </div>

          <div className="relative z-10 w-full max-w-4xl flex flex-col mt-4">
            
            {/* Header Navigation */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10 w-full">
              <button onClick={handleBack} className="w-10 h-10 rounded-full bg-card/50 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-mono font-bold tracking-tighter text-white flex items-center gap-3">
                  <Box className="text-primary w-6 h-6" /> AEGIS<span className="text-primary font-normal">SCAN</span>
                </h1>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">EvoAegis Swarm Explorer</p>
              </div>
            </motion.div>

            {/* Global Network Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "NETWORK STATUS", value: "LIVE", icon: Activity, color: "text-green-400" },
                { label: "TOTAL PEERS", value: "2,847", icon: Shield, color: "text-primary" },
                { label: "LATEST BLOCK", value: `#${blockHeight.toLocaleString()}`, icon: Box, color: "text-accent" },
                { label: "GAS PRICE", value: `${(150 + Math.random() * 50).toFixed(0)} Octas`, icon: Coins, color: "text-secondary" },
              ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card/40 border border-border p-4 rounded-xl flex flex-col justify-center backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-r from-transparent to-white/5 skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">{stat.label}</span>
              </div>
              <span className="text-lg font-mono font-bold text-white">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full bg-card/60 border border-primary/30 rounded-full h-14 mb-8 flex items-center px-6 relative shadow-[0_0_30px_rgba(0,242,254,0.05)]">
           <Search className="w-5 h-5 text-muted-foreground mr-4" />
           <input type="text" placeholder="Search by Txn Hash / Block / Proof Hash" className="bg-transparent border-none outline-none text-sm font-mono text-white flex-1 placeholder:text-muted-foreground/50" readOnly />
           <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-mono uppercase border border-primary/30">Read Only</span>
        </motion.div>

        {/* Latest Transactions Table */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full border border-border bg-card/40 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="border-b border-border p-5 flex items-center justify-between bg-black/20">
              <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> LATEST ML TRANSACTIONS (usr_demo_01)
              </h2>
            </div>
            
            <div className="w-full overflow-x-auto">
              {loading ? (
                <div className="p-10 flex flex-col justify-center items-center text-primary animate-pulse">
                  <Activity className="w-8 h-8 mb-4" />
                  <span className="font-mono text-xs tracking-widest">SYNCING LEDGER...</span>
                </div>
              ) : proofs.length === 0 ? (
                 <div className="p-10 text-center text-muted-foreground font-mono text-sm">No transactions found for this node. Complete a MicroQuest to broadcast a ZK-Proof!</div>
              ) : (
                <table className="w-full text-left font-mono text-[10px] md:text-xs">
                  <thead className="bg-muted/10 text-muted-foreground/80 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-normal">Txn Hash</th>
                      <th className="px-6 py-4 font-normal border-l border-border/50">Details</th>
                      <th className="px-6 py-4 font-normal text-right">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {proofs.map((proof, i) => {
                      const age = Math.max(1, Math.floor((Date.now() - new Date(proof.created_at).getTime()) / 60000));
                      return (
                        <motion.tr key={proof.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="hover:bg-primary/5 transition-colors group">
                          <td className="px-6 py-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                              <span className="text-[10px]">Tx</span>
                            </div>
                            <a href={getExplorerUrl(proof.tx_hash)} target="_blank" rel="noopener noreferrer" className="text-primary truncate max-w-[100px] md:max-w-[180px] cursor-pointer hover:underline flex items-center gap-1">
                              {proof.tx_hash}
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </td>
                          <td className="px-6 py-4 border-l border-border/50">
                            <div className="flex flex-col gap-1">
                              <span className="text-white/80">{age} mins ago</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase inline-block w-fit border ${proof.data_type === "audio" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"}`}>
                                ZK-{proof.data_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            {proof.reward}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>

          {/* LIVE MEMPOOL SIDEBAR */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="w-full border border-border bg-card/60 rounded-2xl p-5 backdrop-blur-md">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-mono font-bold text-white tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary animate-pulse" /> Live Peers
                </h3>
                <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">MEMPOOL</span>
             </div>

             <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {pendingTxs.map((tx, idx) => (
                    <motion.div key={tx.hash} initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, x: -20 }} transition={{ duration: 0.4 }} className="p-3 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono relative overflow-hidden">
                       <div className="flex justify-between items-start mb-1 text-primary/70">
                          <span>PEER_TXN</span>
                          <span className="animate-pulse text-primary">•</span>
                       </div>
                       <p className="text-white/60 truncate mb-2">{tx.hash}</p>
                       <div className="flex justify-between items-center text-[9px]">
                          <span className="text-success uppercase">Broadcasted</span>
                          <span className="text-muted-foreground">just now</span>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {pendingTxs.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl">
                      <div className="w-1 h-1 bg-primary/40 rounded-full animate-ping mb-4" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Listening for Peers...</span>
                  </div>
                )}
             </div>

             <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[9px] font-mono text-muted-foreground uppercase mb-4 tracking-tighter">Network Health</p>
                <div className="space-y-3">
                   {[
                     { l: "Consensus", v: "100%", c: "bg-green-500" },
                     { l: "Throughput", v: "42 TPS", c: "bg-blue-500" },
                     { l: "Verification", v: "6ms", c: "bg-amber-500" },
                   ].map((item, i) => (
                     <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-muted-foreground">{item.l}</span>
                          <span className="text-white">{item.v}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: item.v }} transition={{ delay: 1 + (i*0.2), duration: 1.5 }} className={`h-full ${item.c}`} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AethosScan;
