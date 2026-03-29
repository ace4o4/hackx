import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Zap, BarChart2, Cpu, Activity, Network, Wallet, ExternalLink, ShieldCheck } from "lucide-react";
import EvoTwin from "@/components/EvoTwin";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import { playClick, playWhoosh } from "@/lib/sounds";
import { getTodayFocusMinutes, getRecentSessions } from "@/lib/sessionManager";
import { computePatterns } from "@/lib/patternEngine";
import { loadTwinState, levelProgress, xpForLevel } from "@/lib/twinEngine";
import { getTodayChallenge, type DailyChallenge } from "@/lib/challengeGen";
import { getGreeting } from "@/lib/twinAgent";
import { fetchRecentProofs } from "@/lib/ml";
import { connectWallet, deployContract, getContractAddress, shortenAddress, getWalletBalance, getContractExplorerUrl, autoConnectWallet, disconnectWallet } from "@/lib/blockchain";

interface ZKProof {
  id: number;
  data_type: string;
  proof_hash: string;
  reward: string;
  tx_hash: string;
  created_at: string;
}

const FocusDashboard = () => {
  const navigate = useNavigate();

  const [todayMins, setTodayMins] = useState(0);
  const [greeting, setGreeting] = useState("Loading…");
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [proofs, setProofs] = useState<ZKProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [contractDeployed, setContractDeployed] = useState(!!getContractAddress());
  const [isDeploying, setIsDeploying] = useState(false);

  const twinState = loadTwinState();

  useEffect(() => {
    (async () => {
      const [mins, sessions, recentProofs] = await Promise.all([
        getTodayFocusMinutes(),
        getRecentSessions(30),
        fetchRecentProofs(),
      ]);
      const patterns = computePatterns(sessions);
      setTodayMins(mins);
      setProofs(recentProofs);
      const ch = getTodayChallenge(patterns, twinState);
      setChallenge(ch);
      setLoading(false);
      const msg = await getGreeting({ patterns, twin: twinState, todayMins: mins });
      setGreeting(msg);
      
      // Auto-connect wallet if previously connected
      autoConnectWallet().then(async (res) => {
        if (res) {
          setWalletAddress(res.address);
          const bal = await getWalletBalance(res.address);
          setWalletBalance(bal);
        }
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartFocus = useCallback(() => {
    playClick();
    playWhoosh();
    navigate("/focus");
  }, [navigate]);

  const handleInsights = useCallback(() => {
    playClick();
    navigate("/insights");
  }, [navigate]);

  const handleQuest = useCallback(() => {
    playClick();
    playWhoosh();
    navigate("/quest");
  }, [navigate]);

  const progress = levelProgress(twinState);
  const xpNeeded = xpForLevel(twinState.level);
  const xpCurrent = Math.round(progress * xpNeeded);

  return (
    <div className="relative min-h-[100dvh] bg-background overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0" style={{
        background: "radial-gradient(ellipse 50% 40% at 50% 15%, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
      }} />

      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        {walletAddress ? (
          <div className="flex items-center gap-1.5 bg-card/60 border border-primary/20 rounded-full pl-2.5 pr-1 py-1">
            <Wallet className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-mono text-foreground/80">{shortenAddress(walletAddress)}</span>
            {walletBalance && <span className="text-[8px] font-mono text-muted-foreground mr-1">{walletBalance} APT</span>}
            <button
              onClick={async () => {
                await disconnectWallet();
                setWalletAddress("");
                setWalletBalance("");
              }}
              className="w-5 h-5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
              title="Disconnect Wallet"
            >
              <span className="text-[10px] font-bold">&times;</span>
            </button>
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
                alert(error.message || "Petra Wallet not found");
              }
            }}
            className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary rounded-full px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider uppercase hover:bg-primary/20 transition-colors"
          >
            <Wallet className="w-3 h-3" /> Connect
          </button>
        )}
        <DoodleThemeToggle />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 pb-28">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">EvoAegis</p>
            <h1 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora">Swarm Hub</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 h-9 rounded-full bg-card/60 border border-primary/20 flex items-center gap-2 hover:bg-muted/40 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono text-primary tracking-widest">NETWORK LIVE</span>
            </button>
            <button
              onClick={handleInsights}
              className="w-9 h-9 rounded-full bg-card/60 border border-border flex items-center justify-center hover:bg-muted/40 transition-colors"
              aria-label="View insights"
            >
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* WALLET: Deploy Contract Banner */}
        {walletAddress && !contractDeployed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-secondary/10 border border-secondary/30 p-4 mb-4 flex items-center gap-3"
          >
            <div className="flex-1">
              <p className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider mb-0.5">Deploy Smart Contract</p>
              <p className="text-[9px] font-mono text-muted-foreground">One-time setup for real on-chain ZK-Proofs</p>
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
                  alert("Deploy failed: " + (error.message || "Unknown error"));
                } finally {
                  setIsDeploying(false);
                }
              }}
              disabled={isDeploying}
              className="shrink-0 bg-secondary text-background px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isDeploying ? "Deploying..." : "Deploy"}
            </button>
          </motion.div>
        )}

        {/* Contract Live Badge */}
        {walletAddress && contractDeployed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 flex justify-center"
          >
            <a
              href={getContractExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-[9px] font-mono text-green-500 hover:bg-green-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Differential Privacy Sync Live <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}

        {/* Twin + greeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-6"
        >
          <EvoTwin
            size={180}
            level={twinState.level}
            mood={twinState.streakDays >= 3 ? "excited" : "curious"}
            interactive
            label={twinState.name}
            sublabel={`LVL ${twinState.level}`}
          />

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: loading ? 0 : 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 px-4 py-3 rounded-2xl bg-card/60 border border-border max-w-xs text-center"
          >
            <p className="text-sm font-sans text-foreground/90 leading-relaxed">{greeting}</p>
          </motion.div>
        </motion.div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card/60 border border-border p-4 mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Twin Evolution</p>
            <p className="text-[10px] font-mono text-muted-foreground">{xpCurrent} / {xpNeeded} XP</p>
          </div>
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Daily challenge */}
        {challenge && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card/60 border border-border p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] font-mono text-amber-400 tracking-wider uppercase">Daily Challenge</p>
              {challenge.completed && (
                <span className="ml-auto text-[9px] font-mono text-green-400 tracking-wider">✓ DONE</span>
              )}
            </div>
            <p className="text-sm font-sans font-semibold text-foreground mb-1">{challenge.title}</p>
            <p className="text-xs font-sans text-muted-foreground leading-relaxed">{challenge.description}</p>
          </motion.div>
        )}

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <MiniStat label="TODAY" value={`${todayMins}m`} />
          <MiniStat label="STREAK" value={`${twinState.streakDays}d`} />
          <MiniStat label="SESSIONS" value={`${twinState.totalSessions}`} />
        </motion.div>

        {/* Main CTA: Train ML Brain */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={handleQuest}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-16 rounded-2xl font-mono text-base font-bold text-background tracking-wider shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Cpu className="w-5 h-5 relative z-10" />
            <span className="relative z-10">BURST TRAINING</span>
            <div className="flex items-center gap-1.5 opacity-70 relative z-10">
              <Activity className="w-3 h-3 animate-pulse" />
              <span className="text-[10px]">P2P ZK-SYNC</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Network Activity LEDGER */}
        {proofs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 border border-border bg-card/40 rounded-2xl p-4 shadow-inner"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Network Ledger</h3>
              </div>
              <button 
                onClick={() => { playClick(); navigate('/explorer'); }}
                className="text-[9px] font-mono text-primary flex items-center gap-1 hover:underline p-1"
              >
                View on AegisScan &rarr;
              </button>
            </div>
            
            <div className="space-y-3">
              {proofs.map((proof) => (
                <div key={proof.id} className="p-3 bg-background/50 border border-primary/20 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-8 h-full bg-primary/5 -skew-x-12 translate-x-4 group-hover:-translate-x-full transition-transform duration-700" />
                  
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] text-primary font-mono tracking-tighter truncate w-32 border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded">
                      {proof.tx_hash.slice(0, 8)}...{proof.tx_hash.slice(-6)}
                    </p>
                    <span className="text-[10px] font-mono text-success drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">+{proof.reward}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      {proof.data_type === "audio" ? <span className="text-[8px]">🔊</span> : <span className="text-[8px]">👁️</span>}
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">ZK-{proof.data_type}-PROOF</span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/50">
                      {new Date(proof.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Global Admin Link */}
        <div className="mt-8 pt-6 border-t border-white/5 opacity-30 group-hover:opacity-100 transition-opacity">
          <Link to="/admin" className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors">
            <ShieldCheck className="w-3 h-3" /> [DECENTRALIZED_NODE_ADMIN_PORTAL]
          </Link>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-card/60 border border-border p-3 text-center">
    <p className="text-[9px] font-mono text-muted-foreground tracking-widest mb-1">{label}</p>
    <p className="text-lg font-mono font-bold gradient-text-aurora">{value}</p>
  </div>
);

export default FocusDashboard;
