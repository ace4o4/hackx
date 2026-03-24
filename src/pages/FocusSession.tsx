import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Pause, Play } from "lucide-react";
import EvoTwin from "@/components/EvoTwin";
import { playSuccess, playClick, haptic } from "@/lib/sounds";
import { saveSession, getAllSessions, updateSessionMood } from "@/lib/sessionManager";
import { loadTwinState, saveTwinState, applySession } from "@/lib/twinEngine";
import { getPostSessionMessage } from "@/lib/twinAgent";
import { computePatterns } from "@/lib/patternEngine";
import { completeChallenge, loadTodayChallenge } from "@/lib/challengeGen";

type Phase = "focusing" | "paused" | "done";

const FocusSession = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("focusing");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [moodReflection, setMoodReflection] = useState<"great" | "okay" | "tough" | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer tick
  useEffect(() => {
    if (phase !== "focusing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsedMs(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handlePause = useCallback(() => {
    if (phase !== "focusing") return;
    haptic("light");
    playClick();
    accumulatedRef.current += Date.now() - startTimeRef.current;
    pausedAtRef.current = Date.now();
    setPhase("paused");
  }, [phase]);

  const handleResume = useCallback(() => {
    if (phase !== "paused") return;
    haptic("light");
    playClick();
    startTimeRef.current = Date.now();
    setPhase("focusing");
  }, [phase]);

  const handleEnd = useCallback(async () => {
    haptic("medium");
    playSuccess();

    // Capture final elapsed
    const finalMs = phase === "focusing"
      ? accumulatedRef.current + (Date.now() - startTimeRef.current)
      : accumulatedRef.current;
    const durationMins = Math.max(1, Math.round(finalMs / 60000));

    setPhase("done");
    setLoadingFeedback(true);

    // Save session to IndexedDB
    const endTime = Date.now();
    const startTime = endTime - finalMs;
    const id = await saveSession({ startTime, endTime, durationMs: finalMs });
    setSessionId(id);

    // Update twin state
    const twinState = loadTwinState();
    const allSessions = await getAllSessions();
    const patterns = computePatterns(allSessions);
    const result = applySession(twinState, durationMins, patterns.currentStreak);
    saveTwinState(result.newState);
    setXpGained(result.xpGained);
    setLeveledUp(result.leveledUp);
    setNewLevel(result.newLevel);

    // Check challenge completion
    const challenge = loadTodayChallenge();
    if (challenge && !challenge.completed && durationMins >= challenge.targetMins) {
      completeChallenge();
    }

    // Get AI feedback
    const msg = await getPostSessionMessage({
      patterns,
      twin: result.newState,
      sessionDurationMins: durationMins,
    });
    setFeedback(msg);
    setLoadingFeedback(false);
  }, [phase]);

  const handleMoodSelect = useCallback(async (mood: "great" | "okay" | "tough") => {
    haptic("light");
    setMoodReflection(mood);
    if (sessionId !== null) {
      await updateSessionMood(sessionId, mood);
    }
    setTimeout(() => navigate("/home"), 1200);
  }, [sessionId, navigate]);

  const mins = Math.floor(elapsedMs / 60000);
  const secs = Math.floor((elapsedMs % 60000) / 1000);
  const timeDisplay = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
      }} />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === "focusing" ? [0.03, 0.07, 0.03] : 0.03 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--primary) / 0.15), transparent)" }}
      />

      <AnimatePresence mode="wait">

        {/* ─── FOCUSING / PAUSED ─── */}
        {(phase === "focusing" || phase === "paused") && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm"
          >
            {/* Header */}
            <div className="flex w-full items-center justify-between mb-8">
              <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                {phase === "paused" ? "PAUSED" : "FOCUSING"}
              </span>
              <button
                onClick={handleEnd}
                className="text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
                aria-label="End session"
              >
                <X className="w-3 h-3" /> END
              </button>
            </div>

            {/* Twin */}
            <EvoTwin
              size={160}
              level={loadTwinState().level}
              mood={phase === "focusing" ? "thinking" : "sleepy"}
              className="mb-8"
            />

            {/* Timer */}
            <motion.div
              className="font-mono text-6xl font-bold tracking-tighter gradient-text-aurora mb-2"
              animate={phase === "paused" ? { opacity: [1, 0.4, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {timeDisplay}
            </motion.div>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest mb-10">
              {phase === "focusing" ? "STAY FOCUSED" : "SESSION PAUSED"}
            </p>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={phase === "focusing" ? handlePause : handleResume}
                className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                aria-label={phase === "focusing" ? "Pause" : "Resume"}
              >
                {phase === "focusing"
                  ? <Pause className="w-5 h-5 text-foreground" />
                  : <Play className="w-5 h-5 text-primary" />
                }
              </button>
              <motion.button
                onClick={handleEnd}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-14 rounded-full font-mono text-sm font-semibold text-background tracking-wider"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
                aria-label="End session"
              >
                END SESSION
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── DONE ─── */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm"
          >
            {leveledUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.15))", border: "1px solid hsl(var(--primary) / 0.3)" }}
              >
                ✨ LEVEL {newLevel} UNLOCKED
              </motion.div>
            )}

            <EvoTwin
              size={140}
              level={newLevel}
              mood="excited"
              className="mb-5"
            />

            <div className="font-mono text-4xl font-bold gradient-text-aurora mb-1">{timeDisplay}</div>
            <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-4">
              +{xpGained} XP
            </div>

            {/* AI Feedback */}
            <div className="w-full rounded-2xl bg-card/60 border border-border p-4 mb-6 min-h-[64px] flex items-center justify-center">
              {loadingFeedback ? (
                <motion.div
                  className="flex gap-1.5"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ))}
                </motion.div>
              ) : (
                <p className="text-sm font-sans text-foreground/90 leading-relaxed">{feedback}</p>
              )}
            </div>

            {/* Mood reflection */}
            {!moodReflection ? (
              <div className="w-full">
                <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-3">HOW WAS THAT SESSION?</p>
                <div className="flex gap-2">
                  {(["great", "okay", "tough"] as const).map(m => (
                    <motion.button
                      key={m}
                      onClick={() => handleMoodSelect(m)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider border transition-colors hover:bg-primary/10 border-border"
                    >
                      {m === "great" ? "🔥 Great" : m === "okay" ? "👍 Okay" : "😤 Tough"}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-mono text-muted-foreground"
              >
                Logged as <span className="text-primary font-bold capitalize">{moodReflection}</span>. Redirecting…
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusSession;
