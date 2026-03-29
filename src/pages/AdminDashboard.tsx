import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Trash2, 
  ExternalLink, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck,
  Zap,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { getVaultRecords, clearVault, type VaultRecord } from "@/lib/localVault";
import { fetchAIMemories, fetchRecentProofs, type AIMemory, type ZKProof } from "@/lib/ml";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [aiMemories, setAiMemories] = useState<AIMemory[]>([]);
  const [proofs, setProofs] = useState<ZKProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [v, m, p] = await Promise.all([
        getVaultRecords(),
        fetchAIMemories(),
        fetchRecentProofs()
      ]);
      setVaultRecords(v.sort((a, b) => b.timestamp - a.timestamp));
      setAiMemories(m);
      setProofs(p);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearVault = async () => {
    if (confirm("Are you sure? This will delete all ON-DEVICE training data.")) {
      await clearVault();
      toast.success("Vault Cleared");
      loadAllData();
    }
  };

  const chartData = vaultRecords.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    metric: r.metadata.metric,
    type: r.type
  })).reverse();

  return (
    <div className="min-h-screen bg-[#050505] text-foreground p-4 md:p-8 font-mono">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/hub" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-primary flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> NEURAL_ADMIN_PORTAL
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Authorized Access Only // Secure Node 01</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-xs text-primary transition-all flex items-center gap-2"
          >
            <Zap className="w-3 h-3" /> REFRESH_NODE
          </button>
          <button 
            onClick={handleClearVault}
            className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded text-xs text-destructive transition-all flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" /> WIPE_LOCAL_VAULT
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stats Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Card */}
          <div className="bg-card/30 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold flex items-center gap-2 text-primary">
                <BarChart3 className="w-4 h-4" /> REINFORCEMENT_METRIC_TREND
              </h2>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20">LIVE_TELEMETRY</span>
            </div>
            
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="metric" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorMetric)" 
                      strokeWidth={2}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs border border-dashed border-white/10 rounded-lg">
                  NO_DATA_RECORDS_FOUND
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-card/30 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-xs font-bold flex items-center gap-2">
                <Database className="w-3 h-3" /> LOCAL_VAULT_EXPLORER
              </h2>
              <span className="text-[10px] opacity-40">{vaultRecords.length} LOGS_STORED</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="p-4 font-normal">TIMESTAMP</th>
                    <th className="p-4 font-normal">TYPE</th>
                    <th className="p-4 font-normal">METRIC</th>
                    <th className="p-4 font-normal">ZK_READY</th>
                    <th className="p-4 font-normal">INSIGHT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vaultRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(record.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] ${record.type === 'image' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {record.type} 
                        </span>
                      </td>
                      <td className="p-4 text-primary font-bold">{record.metadata.metric.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                      </td>
                      <td className="p-4 text-muted-foreground truncate max-w-[200px]">{record.metadata.insight}</td>
                    </tr>
                  ))}
                  {vaultRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-muted-foreground opacity-20">
                        EMPTY_VAULT_NODE
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Memories & Status Sidebar */}
        <div className="space-y-6">
          <div className="bg-card/30 border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
              <BrainCircuit className="w-4 h-4" /> NEURAL_MEMORY_HISTORY
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {aiMemories.map((mem) => (
                <div key={mem.id} className="p-3 bg-white/5 border border-white/5 rounded-lg">
                  <p className="text-[10px] text-primary/50 mb-1">{new Date(mem.created_at).toLocaleString()}</p>
                  <p className="text-xs italic text-muted-foreground leading-relaxed">"{mem.memory_text}"</p>
                </div>
              ))}
              {aiMemories.length === 0 && <p className="text-center text-[10px] opacity-20 py-8">NO_MEMORIES_COMMITTED</p>}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <h2 className="text-xs font-bold mb-4 uppercase tracking-widest text-primary">System Integrity</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="opacity-60">Status</span>
                <span className="text-success font-bold tracking-tighter shadow-green-500/20 shadow-sm px-2 bg-green-500/10 rounded">CONNECTED_SECURE</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="opacity-60">Core Enclave</span>
                <span className="opacity-90">ISO-27001 SIMULATED</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="opacity-60">ZK Validator</span>
                <span className="opacity-90">ACTIVE_WASM</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] mb-2">
                  <span className="opacity-60">Decentralized Contribution</span>
                  <span className="text-primary">{proofs.length} PROOFS</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, proofs.length * 10)}%` }}
                    className="bg-primary h-full shadow-[0_0_10px_hsl(var(--primary))]" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 242, 254, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
