/**
 * Twin Agent — AI coaching with 3-tier fallback
 * Tier 1: Chrome Prompt API (Gemini Nano) — on-device, zero network
 * Tier 2: Gemini API (cloud fallback) — best quality, stats-only
 * Tier 3: Template responses — always works, no LLM needed
 *
 * PRIVACY: Only computed stats are ever sent to an LLM. Never raw data.
 */

import type { PatternSummary } from "./patternEngine";
import type { TwinState } from "./twinEngine";
import { formatHour, DAY_NAMES } from "./patternEngine";

export interface AgentContext {
  patterns: PatternSummary;
  twin: TwinState;
  sessionDurationMins?: number; // for post-session messages
  todayMins?: number;
}

/** Build a concise stats summary to send to an LLM (no raw data) */
function buildStatsSummary(ctx: AgentContext): string {
  const { patterns, twin } = ctx;
  const parts: string[] = [
    `level ${twin.level}`,
    `streak ${twin.streakDays} days`,
    `avg focus ${patterns.avgDurationMins} min`,
    `total sessions ${patterns.totalSessions}`,
    `total hours ${patterns.totalHours}h`,
  ];
  if (patterns.peakHour !== null) parts.push(`peak hour ${formatHour(patterns.peakHour)}`);
  if (patterns.peakDay !== null) parts.push(`best day ${DAY_NAMES[patterns.peakDay]}`);
  if (patterns.weeklyTrendPct !== 0)
    parts.push(`weekly trend ${patterns.weeklyTrendPct > 0 ? "+" : ""}${patterns.weeklyTrendPct}%`);
  return parts.join(", ");
}

/** Tier 3: Template-based greeting (always available) */
function templateGreeting(ctx: AgentContext): string {
  const { patterns, twin } = ctx;
  const h = new Date().getHours();
  const timeGreet =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  if (patterns.totalSessions === 0) {
    return `${timeGreet}! Ready to start your first focus session? Your twin is excited to meet you. 🌱`;
  }
  if (twin.streakDays >= 7) {
    return `${timeGreet}! ${twin.streakDays}-day streak — you're on fire! Your twin is glowing with pride. 🔥`;
  }
  if (twin.streakDays >= 3) {
    return `${timeGreet}! ${twin.streakDays} days strong. Keep the momentum going! 💪`;
  }
  if (patterns.peakHour !== null) {
    const peakLabel = formatHour(patterns.peakHour);
    const isNearPeak = Math.abs(new Date().getHours() - patterns.peakHour) <= 1;
    if (isNearPeak) {
      return `${timeGreet}! ${peakLabel} is usually your golden hour. Now's the time to focus! ⚡`;
    }
  }
  if (patterns.weeklyTrendPct > 0) {
    return `${timeGreet}! You've improved ${patterns.weeklyTrendPct}% this week. Keep building! 📈`;
  }
  return `${timeGreet}! Your twin is ready whenever you are. Let's focus! 🧠`;
}

/** Tier 3: Template-based post-session message */
function templatePostSession(ctx: AgentContext): string {
  const { patterns, twin, sessionDurationMins = 0 } = ctx;
  const avg = patterns.avgDurationMins;

  if (sessionDurationMins > avg + 10) {
    return `🎉 ${sessionDurationMins} minutes — that's ${sessionDurationMins - avg} more than your usual! Your twin leveled up!`;
  }
  if (sessionDurationMins >= avg) {
    return `✅ Solid ${sessionDurationMins}-minute session! Right on track. Your twin is growing stronger.`;
  }
  if (twin.streakDays >= 1) {
    return `⭐ ${sessionDurationMins} minutes done. Short sessions still count — your streak lives on!`;
  }
  return `✨ Great job finishing a ${sessionDurationMins}-minute session! Every bit helps your twin evolve.`;
}

/** Tier 3: Template-based insight */
function templateInsight(ctx: AgentContext): string {
  const { patterns } = ctx;

  if (patterns.totalSessions < 3) {
    return "Complete a few more sessions so your twin can start learning your patterns!";
  }
  if (patterns.peakHour !== null && patterns.peakDay !== null) {
    return `Your focus peaks around ${formatHour(patterns.peakHour)} on ${DAY_NAMES[patterns.peakDay]}s. Schedule your hardest work then!`;
  }
  if (patterns.weeklyTrendPct > 10) {
    return `You're improving fast — up ${patterns.weeklyTrendPct}% this week. Consistency is compounding!`;
  }
  if (patterns.weeklyTrendPct < -10) {
    return "Focus time dipped this week. Try a short 15-minute session to rebuild momentum.";
  }
  return `You've accumulated ${patterns.totalHours} hours of deep focus. That's impressive! Keep going.`;
}

const SYSTEM_PROMPT =
  "You are a friendly, concise AI productivity coach for a focus app called Focus Twin. Keep responses under 2 sentences.";

/** 
 * Tier 1: Try Chrome Prompt API (Gemini Nano) 
 * Tier 3: Fallback to Node.js AI Proxy (Gemini Cloud API) 
 */
async function queryAI(prompt: string): Promise<string | null> {
  // 1. Try On-Device Chrome AI
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ai = (window as any).ai;
    if (ai?.languageModel) {
      const session = await ai.languageModel.create({ systemPrompt: SYSTEM_PROMPT });
      const result = await session.prompt(prompt);
      session.destroy();
      if (typeof result === "string") return result;
    }
  } catch {
    console.warn("[Twin Agent] Chrome AI not available. Falling back to secure Cloud Proxy.");
  }

  // 2. Try Node Proxy (Tier 3 Fallback)
  try {
    const res = await fetch("http://localhost:3002/api/ai/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.result) return data.result;
    }
  } catch (err) {
    console.warn("[Twin Agent] Cloud Proxy unreachable. Falling back to templates.");
  }

  return null;
}

/** Generate a personalized greeting */
export async function getGreeting(ctx: AgentContext): Promise<string> {
  const stats = buildStatsSummary(ctx);
  const h = new Date().getHours();
  const timeHint = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";

  const llmResult = await queryAI(
    `It's ${timeHint}. User stats: ${stats}. Give a 1-sentence motivational greeting.`
  );
  return llmResult ?? templateGreeting(ctx);
}

/** Generate post-session feedback */
export async function getPostSessionMessage(ctx: AgentContext): Promise<string> {
  const stats = buildStatsSummary(ctx);
  const mins = ctx.sessionDurationMins ?? 0;

  const llmResult = await queryAI(
    `User just finished a ${mins}-minute focus session. Stats: ${stats}. Give a 1-sentence celebration and coaching tip.`
  );
  return llmResult ?? templatePostSession(ctx);
}

/** Generate an insight card message */
export async function getInsight(ctx: AgentContext): Promise<string> {
  const stats = buildStatsSummary(ctx);

  const llmResult = await queryAI(
    `Based on focus stats: ${stats}. Give one actionable insight in 1 sentence.`
  );
  return llmResult ?? templateInsight(ctx);
}
