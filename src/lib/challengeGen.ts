/**
 * Challenge Generator — Personalized daily micro-challenges
 * Uses pattern stats and twin state to generate one challenge per day.
 * Challenge stored in localStorage, refreshed daily.
 */

import type { PatternSummary } from "./patternEngine";
import type { TwinState } from "./twinEngine";
import { DAY_NAMES } from "./patternEngine";

export interface DailyChallenge {
  id: string;
  date: string;          // YYYY-MM-DD
  title: string;
  description: string;
  targetMins: number;
  completed: boolean;
  completedAt?: number;  // timestamp ms
}

const STORAGE_KEY = "focus-twin:challenge";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Load today's challenge from localStorage */
export function loadTodayChallenge(): DailyChallenge | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as DailyChallenge;
    if (c.date !== todayKey()) return null; // stale
    return c;
  } catch {
    return null;
  }
}

/** Save challenge to localStorage */
export function saveChallenge(c: DailyChallenge): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (_) { /* storage unavailable */ }
}

/** Mark today's challenge as completed */
export function completeChallenge(): void {
  const c = loadTodayChallenge();
  if (!c) return;
  c.completed = true;
  c.completedAt = Date.now();
  saveChallenge(c);
}

/** Generate a new personalized daily challenge */
export function generateChallenge(
  patterns: PatternSummary,
  twin: TwinState
): DailyChallenge {
  const date = todayKey();
  const today = new Date().getDay();
  const todayName = DAY_NAMES[today];

  let title: string;
  let description: string;
  let targetMins: number;

  const avg = patterns.avgDurationMins || 25;

  // No sessions yet — onboarding challenge
  if (patterns.totalSessions === 0) {
    title = "First Focus";
    description = "Complete your very first focus session. Any duration counts!";
    targetMins = 10;
  }
  // Early stage (< 7 sessions)
  else if (patterns.totalSessions < 7) {
    targetMins = Math.max(10, avg + 5);
    title = "Beat Your Best";
    description = `Try a ${targetMins}-minute session — just a bit longer than your average of ${avg} minutes.`;
  }
  // Streak in danger (no session yesterday)
  else if (twin.streakDays === 0 && patterns.totalSessions > 3) {
    targetMins = Math.max(10, Math.round(avg * 0.75));
    title = "Restart the Streak";
    description = `Your streak paused. Jump back with a quick ${targetMins}-minute session today.`;
  }
  // Long streak — celebrate
  else if (twin.streakDays >= 7) {
    targetMins = avg + 10;
    title = `${twin.streakDays}-Day Streak Hero`;
    description = `You've been consistent for ${twin.streakDays} days! Push to ${targetMins} minutes today.`;
  }
  // Dead zone challenge (peak day is NOT today — push through)
  else if (patterns.peakDay !== null && patterns.peakDay !== today && patterns.totalSessions >= 10) {
    const peakName = DAY_NAMES[patterns.peakDay];
    targetMins = Math.max(15, Math.round(avg * 0.9));
    title = `Break the ${todayName} Pattern`;
    description = `${peakName} is usually your best. Show ${todayName} what you've got — ${targetMins} minutes!`;
  }
  // Default progressive challenge
  else {
    targetMins = avg + 5;
    title = "Level Up";
    description = `Your average is ${avg} min. Go for ${targetMins} minutes today and grow your twin!`;
  }

  const challenge: DailyChallenge = {
    id: `${date}-${Math.random().toString(36).slice(2, 6)}`,
    date,
    title,
    description,
    targetMins,
    completed: false,
  };

  saveChallenge(challenge);
  return challenge;
}

/** Get or generate today's challenge */
export function getTodayChallenge(
  patterns: PatternSummary,
  twin: TwinState
): DailyChallenge {
  return loadTodayChallenge() ?? generateChallenge(patterns, twin);
}
