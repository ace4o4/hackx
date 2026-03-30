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
    <div className="relative min-h-[100dvh] bg-background cyber-grid overflow-hidden text-foreground font-mono">
      {/* Corner Overlays */}
      <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-primary/50"></div>
      <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-primary/50"></div>
      
      {/* Top Ledger Navbar */}
      <div className="fixed top-0 left-0 w-full h-12 bg-black/60 backdrop-blur-md border-b border-primary/20 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] tracking-widest text-primary/80">SYS.LINK // ACTIVE</span>
        </div>
        
        <div className="flex items-center gap-2">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-secondary/80 border border-primary/30 px-2 py-1 rounded-none border-tech">
              <span className="text-[9px] text-primary">{shortenAddress(walletAddress)}</span>
              {walletBalance && <span className="text-[8px] text-muted-foreground">| {walletBalance} APT</span>}
              <button onClick={async () => { await disconnectWallet(); setWalletAddress(""); setWalletBalance(""); }} className="text-red-500 font-bold ml-1">X</button>
            </div>
          ) : (
            <button onClick={async () => {
              try {
                const { address } = await connectWallet(); setWalletAddress(address); setWalletBalance(await getWalletBalance(address));
              } catch (e: unknown) { alert((e as Error).message || "Wallet not found"); }
            }} className="border-tech bg-secondary/50 hover:bg-primary/20 text-primary px-3 py-1 text-[9px] tracking-widest uppercase transition-all">
              [ CONNECT_NODE ]
            </button>
          )}
          <DoodleThemeToggle />
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-28">

        {/* Header HUD */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 border-l-2 border-primary pl-4 relative">
          <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary"></div>
          <p className="text-[10px] text-primary tracking-widest uppercase mb-1">EVO_AEGIS // TERMINAL</p>
          <h1 className="text-3xl font-bold tracking-tighter text-foreground uppercase glitch" data-text="SWARM_HUB">SWARM_HUB</h1>
          <div className="mt-2 flex gap-2">
            <button className="border border-primary/30 bg-primary/10 px-2 h-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
              <span className="text-[9px] text-primary tracking-widest">NETWORK LIVE</span>
            </button>
            <button onClick={handleInsights} className="border border-border bg-secondary/80 px-2 h-6 flex items-center hover:bg-primary/20 transition-all">
              <span className="text-[9px] text-muted-foreground tracking-widest">DIAGNOSTICS</span>
            </button>
          </div>
        </motion.div>

        {/* Twin + greeting (Cyber Frame) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 relative">
          <div className="glass-surface p-4 clip-cyber border-tech flex flex-col items-center">
            <div className="absolute top-2 left-2 text-[8px] text-primary/50 tracking-widest">UNIT_{twinState.level}</div>
            <div className="absolute bottom-2 right-2 text-[8px] text-primary/50 tracking-widest">ID:{twinState.name.toUpperCase()}</div>
            
            <EvoTwin size={160} level={twinState.level} mood={twinState.streakDays >= 3 ? "excited" : "curious"} interactive label={twinState.name} sublabel={`LVL ${twinState.level}`} />
            
            <div className="mt-4 w-full bg-black/40 border border-primary/20 p-3 text-center text-xs tracking-wider text-primary/90">
              {loading ? "ESTABLISHING NEURAL LINK..." : greeting}
            </div>
          </div>
        </motion.div>

        {/* XP Bar */}
        <div className="mb-6 bg-secondary/40 border border-border p-3 clip-cyber relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-muted-foreground tracking-widest">EVOLUTION_PROGRESS</span>
            <span className="text-[10px] text-primary">{xpCurrent}/{xpNeeded}</span>
          </div>
          <div className="w-full h-1 bg-black overflow-hidden relative border border-primary/20">
            <motion.div className="absolute top-0 left-0 h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1 }} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <MiniStat label="UPTIME" value={`${todayMins}m`} />
          <MiniStat label="STREAK" value={`${twinState.streakDays}d`} />
          <MiniStat label="CYCLES" value={`${twinState.totalSessions}`} />
        </div>

        {/* Daily challenge */}
        {challenge && (
          <div className="mb-6 border-tech bg-secondary/30 p-4 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-primary tracking-widest">DIRECTIVE // DAILY</span>
              </div>
              {challenge.completed && <span className="text-[9px] bg-primary/20 text-primary px-1 border border-primary/30">✓ EXECUTED</span>}
            </div>
            <p className="text-sm font-bold text-foreground relative z-10 uppercase">{challenge.title}</p>
            <p className="text-[10px] text-muted-foreground mt-1 relative z-10">{challenge.description}</p>
          </div>
        )}

        {/* Contract & Ledger */}
        <div className="space-y-4 mb-6">
          {/* Main CTA */}
          <button onClick={handleQuest} className="w-full h-14 bg-primary text-black font-bold tracking-widest border-2 border-primary hover:bg-black hover:text-primary transition-all flex items-center justify-between px-6 clip-cyber-md group">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 group-hover:animate-spin" />
              <span>INITIATE_BURST</span>
            </div>
            <div className="text-[10px] opacity-70 flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> P2P ZK-SYNC
            </div>
          </button>

          {/* Wallet Actions */}
          {walletAddress && !contractDeployed && (
            <div className="bg-secondary/50 border border-primary/30 p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-primary tracking-wider">DEPLOY ZK_CONTRACT</p>
              </div>
              <button disabled={isDeploying} onClick={async () => { try { setIsDeploying(true); const { signer } = await connectWallet(); await deployContract(signer); setContractDeployed(true); } catch(e) { alert("Failed"); } finally { setIsDeploying(false); } }} className="bg-black border border-primary text-primary px-3 py-1 text-[10px] hover:bg-primary hover:text-black transition-colors">
                {isDeploying ? "DEPLOYING..." : "EXECUTE"}
              </button>
            </div>
          )}
          {walletAddress && contractDeployed && (
            <a href={getContractExplorerUrl()} target="_blank" rel="noopener noreferrer" className="block text-center border border-primary/30 bg-primary/5 text-primary text-[9px] py-1 hover:bg-primary/10 transition-colors tracking-widest">
              &gt; VERIFY DIFFERENTIAL PRIVACY SYNC [ON_CHAIN] &lt;
            </a>
          )}
        </div>

        {/* Network Ledger */}
        {proofs.length > 0 && (
          <div className="border border-border bg-black/40 p-4 clip-cyber-tl-br">
            <div className="flex justify-between items-end border-b border-primary/20 pb-2 mb-3">
              <span className="text-[10px] text-primary tracking-widest">NETWORK_LEDGER</span>
              <button onClick={() => { playClick(); navigate('/explorer'); }} className="text-[9px] text-muted-foreground hover:text-primary transition-colors">VIEW_ALL &gt;</button>
            </div>
            <div className="space-y-2">
              {proofs.map(p => (
                <div key={p.id} className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-primary opacity-70">[{p.data_type.toUpperCase()}]</span>
                    <span className="text-muted-foreground">{p.tx_hash.slice(0, 8)}</span>
                  </div>
                  <span className="text-primary font-bold">+{p.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Admin Link */}
        <div className="mt-8 text-center opacity-30 hover:opacity-100 transition-opacity">
          <Link to="/admin" className="text-[10px] text-primary tracking-widest flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> [ROOT_ACCESS_PORTAL]
          </Link>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-border bg-secondary/30 p-2 text-center clip-cyber-md flex flex-col items-center justify-center hover:bg-primary/10 transition-colors">
    <p className="text-[8px] text-primary/70 tracking-widest mb-1">{label}</p>
    <p className="text-sm text-foreground font-bold">{value}</p>
  </div>
);

export default FocusDashboard;
