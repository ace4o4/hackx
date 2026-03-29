import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getAllSessions } from "@/lib/sessionManager";
import { computePatterns, formatHour, DAY_NAMES, type PatternSummary } from "@/lib/patternEngine";
import { loadTwinState } from "@/lib/twinEngine";
import { getInsight } from "@/lib/twinAgent";
import { fetchAIMemories } from "@/lib/ml";
import DoodleThemeToggle from "@/components/DoodleThemeToggle";
import EvoTwin from "@/components/EvoTwin";

const Insights = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<PatternSummary | null>(null);
  const [insight, setInsight] = useState<string>("");
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [sessions, memoryHistory] = await Promise.all([
        getAllSessions(),
        fetchAIMemories()
      ]);
      const p = computePatterns(sessions);
      setPatterns(p);
      setMemories(memoryHistory);
      setLoading(false);
      const twin = loadTwinState();
      const msg = await getInsight({ patterns: p, twin });
      setInsight(msg);
    })();
  }, []);

  const twinState = loadTwinState();

  return (
    <div className="relative min-h-[100dvh] bg-background overflow-hidden">
      <div className="fixed inset-0" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 10%, hsl(var(--secondary) / 0.06) 0%, transparent 70%)",
      }} />
      <div className="fixed top-5 right-5 z-50"><DoodleThemeToggle /></div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button onClick={() => navigate("/home")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">INSIGHTS</p>
            <h1 className="text-xl font-mono font-bold tracking-tighter gradient-text-aurora">Your Patterns</h1>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex gap-1.5"
            >
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary" />
              ))}
            </motion.div>
            <p className="text-xs font-mono text-muted-foreground mt-3 tracking-wider">ANALYZING PATTERNS…</p>
          </div>
        ) : patterns && (
          <>
            {/* Overview cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3 mb-5"
            >
              <StatCard label="TOTAL HOURS" value={`${patterns.totalHours}h`} sub={`${patterns.totalSessions} sessions`} accent="cyan" delay={0.1} />
              <StatCard label="AVG SESSION" value={`${patterns.avgDurationMins}m`} sub="per session" accent="violet" delay={0.2} />
              <StatCard
                label="STREAK"
                value={`${patterns.currentStreak}d`}
                sub={`best: ${patterns.longestStreak}d`}
                accent="amber"
                delay={0.3}
              />
              <StatCard
                label="THIS WEEK"
                value={`${patterns.thisWeekAvgMins}m`}
                sub={<TrendIndicator pct={patterns.weeklyTrendPct} />}
                accent="success"
                delay={0.4}
              />
            </motion.div>

            {/* AI Insight card */}
            {insight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="rounded-2xl bg-card/60 border border-border p-4 mb-5"
              >
                <div className="flex gap-3">
                  <EvoTwin size={48} level={twinState.level} mood="curious" />
                  <div>
                    <p className="text-[10px] font-mono text-primary tracking-wider mb-1">TWIN INSIGHT</p>
                    <p className="text-sm font-sans text-foreground/90 leading-relaxed">{insight}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Neural Memory Matrix */}
            {memories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="rounded-2xl bg-card/60 border border-primary/20 p-4 mb-5 shadow-[0_0_15px_rgba(0,242,254,0.1)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                  <p className="text-[10px] font-mono text-primary tracking-widest uppercase font-bold">Neural Memory Matrix</p>
                </div>
                
                <p className="text-xs text-muted-foreground font-sans mb-4">
                  Real-time insights learned from your encrypted Local Edge ML focus sessions. These are securely fed back into your Super Intelligence Twin.
                </p>
                
                <div className="space-y-3 relative z-10">
                  {memories.map((mem) => (
                    <div key={mem.id} className="p-3 bg-background/60 border border-primary/10 rounded-xl relative group hover:border-primary/40 transition-colors">
                      <p className="text-[11px] font-mono text-primary/80 leading-relaxed">
                        <span className="text-muted-foreground mr-2 font-bold">{">"}</span>
                        {mem.memory_text}
                      </p>
                      <div className="mt-2 text-[8px] font-mono text-muted-foreground uppercase flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                         <span>SECURE LOCAL COMMIT</span>
                         <span>{new Date(mem.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Peak hour */}
            {patterns.peakHour !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-card/60 border border-border p-4 mb-5"
              >
                <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-3 uppercase">Best Focus Hour</p>
                <HourChart distribution={patterns.hourlyDistribution} peakHour={patterns.peakHour} />
                <p className="text-xs font-sans text-foreground/70 mt-3">
                  You focus best around <span className="font-semibold text-primary">{formatHour(patterns.peakHour)}</span>.
                </p>
              </motion.div>
            )}

            {/* Day of week */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-card/60 border border-border p-4 mb-5"
            >
              <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-3 uppercase">Best Focus Day</p>
              <DayChart distribution={patterns.weeklyDistribution} peakDay={patterns.peakDay} />
              {patterns.peakDay !== null && (
                <p className="text-xs font-sans text-foreground/70 mt-3">
                  <span className="font-semibold text-primary">{DAY_NAMES[patterns.peakDay]}</span> is your most productive day.
                </p>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

const StatCard = ({
  label, value, sub, accent, delay,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  accent: "cyan" | "violet" | "amber" | "success";
  delay: number;
}) => {
  const colors = {
    cyan: "hsl(175, 90%, 55%)",
    violet: "hsl(270, 70%, 65%)",
    amber: "hsl(35, 95%, 60%)",
    success: "hsl(145, 70%, 55%)",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-card/60 border border-border p-4"
    >
      <p className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase mb-1">{label}</p>
      <p className="text-2xl font-mono font-bold" style={{ color: colors[accent] }}>{value}</p>
      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{sub}</div>
    </motion.div>
  );
};

const TrendIndicator = ({ pct }: { pct: number }) => {
  if (pct > 0) return <span className="text-green-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{pct}% vs last wk</span>;
  if (pct < 0) return <span className="text-red-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />{pct}% vs last wk</span>;
  return <span className="text-muted-foreground flex items-center gap-0.5"><Minus className="w-3 h-3" />no change</span>;
};

const HourChart = ({ distribution, peakHour }: { distribution: number[]; peakHour: number }) => {
  const max = Math.max(...distribution, 1);
  const visibleHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  return (
    <div className="flex items-end gap-0.5 h-14">
      {visibleHours.map(h => {
        const height = Math.max(4, (distribution[h] / max) * 48);
        const isPeak = h === peakHour;
        return (
          <div key={h} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t"
              style={{
                height,
                background: isPeak
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground) / 0.25)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const DayChart = ({ distribution, peakDay }: { distribution: number[]; peakDay: number | null }) => {
  const max = Math.max(...distribution, 1);
  return (
    <div className="flex items-end gap-1.5 h-14">
      {DAY_NAMES.map((name, i) => {
        const height = Math.max(4, (distribution[i] / max) * 48);
        const isPeak = i === peakDay;
        return (
          <div key={name} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t"
              style={{
                height,
                background: isPeak
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground) / 0.25)",
              }}
            />
            <span className="text-[8px] font-mono text-muted-foreground">{name[0]}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Insights;
