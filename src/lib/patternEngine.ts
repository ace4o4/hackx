/**
 * Pattern Engine — Statistical focus pattern analysis
 * Runs 100% on-device. Detects peak hours, trends, streaks.
 * Results feed the Twin Agent for personalized coaching.
 */

import type { FocusSession } from "./sessionManager";

export interface PatternSummary {
  /** Average session duration in minutes */
  avgDurationMins: number;
  /** Best focus hour of day (0-23) */
  peakHour: number | null;
  /** Best focus day of week (0=Sun, 6=Sat) */
  peakDay: number | null;
  /** Current streak (consecutive days with at least one session) */
  currentStreak: number;
  /** Longest streak ever */
  longestStreak: number;
  /** Total sessions */
  totalSessions: number;
  /** Total focus time in hours */
  totalHours: number;
  /** Focus minutes per hour-of-day (24 buckets) */
  hourlyDistribution: number[];
  /** Focus minutes per day-of-week (7 buckets, 0=Sun) */
  weeklyDistribution: number[];
  /** Weekly trend: average mins per day this week vs last week */
  weeklyTrendPct: number;
  /** Average duration this week */
  thisWeekAvgMins: number;
  /** Average duration last week */
  lastWeekAvgMins: number;
}

/**
 * Compute full pattern summary from a list of sessions.
 * Pass the result of getAllSessions() or getRecentSessions(30).
 */
export function computePatterns(sessions: FocusSession[]): PatternSummary {
  if (sessions.length === 0) {
    return {
      avgDurationMins: 0,
      peakHour: null,
      peakDay: null,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      totalHours: 0,
      hourlyDistribution: Array(24).fill(0),
      weeklyDistribution: Array(7).fill(0),
      weeklyTrendPct: 0,
      thisWeekAvgMins: 0,
      lastWeekAvgMins: 0,
    };
  }

  const totalMs = sessions.reduce((s, x) => s + x.durationMs, 0);
  const avgDurationMins = Math.round(totalMs / sessions.length / 60000);
  const totalHours = parseFloat((totalMs / 3600000).toFixed(1));

  // Hourly and weekly distributions (focus minutes per bucket)
  const hourlyDistribution = Array(24).fill(0);
  const weeklyDistribution = Array(7).fill(0);

  for (const s of sessions) {
    const date = new Date(s.startTime);
    const h = date.getHours();
    const d = date.getDay();
    const mins = s.durationMs / 60000;
    hourlyDistribution[h] += mins;
    weeklyDistribution[d] += mins;
  }

  // Peak hour (most focus minutes) — null when no data
  const maxHour = Math.max(...hourlyDistribution);
  const peakHour = maxHour > 0 ? hourlyDistribution.indexOf(maxHour) : null;
  // Peak day (most focus minutes) — null when no data
  const maxDay = Math.max(...weeklyDistribution);
  const peakDay = maxDay > 0 ? weeklyDistribution.indexOf(maxDay) : null;

  // Streak calculation (consecutive calendar days with at least one session)
  const daySet = new Set<string>();
  for (const s of sessions) {
    daySet.add(toDateKey(new Date(s.startTime)));
  }

  const today = new Date();
  let currentStreak = 0;
  const cursor = new Date(today);
  while (daySet.has(toDateKey(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // If today has no session yet, check if yesterday starts the streak
  if (currentStreak === 0) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const c2 = new Date(yesterday);
    while (daySet.has(toDateKey(c2))) {
      currentStreak++;
      c2.setDate(c2.getDate() - 1);
    }
  }

  // Longest streak (sliding window over sorted unique days)
  const sortedDays = Array.from(daySet).sort();
  let maxStreak = 0;
  let runStreak = 0;
  let prevKey = "";
  for (const key of sortedDays) {
    if (prevKey === "") {
      runStreak = 1;
    } else {
      const prev = new Date(prevKey);
      prev.setDate(prev.getDate() + 1);
      if (toDateKey(prev) === key) {
        runStreak++;
      } else {
        runStreak = 1;
      }
    }
    if (runStreak > maxStreak) maxStreak = runStreak;
    prevKey = key;
  }

  // Weekly trend (this week vs last week avg mins per session day)
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekSessions = sessions.filter(s => s.startTime >= now - weekMs);
  const lastWeekSessions = sessions.filter(
    s => s.startTime >= now - 2 * weekMs && s.startTime < now - weekMs
  );

  const thisWeekAvgMins =
    thisWeekSessions.length > 0
      ? Math.round(
          thisWeekSessions.reduce((a, s) => a + s.durationMs, 0) /
            thisWeekSessions.length /
            60000
        )
      : 0;
  const lastWeekAvgMins =
    lastWeekSessions.length > 0
      ? Math.round(
          lastWeekSessions.reduce((a, s) => a + s.durationMs, 0) /
            lastWeekSessions.length /
            60000
        )
      : 0;

  const weeklyTrendPct =
    lastWeekAvgMins > 0
      ? Math.round(((thisWeekAvgMins - lastWeekAvgMins) / lastWeekAvgMins) * 100)
      : 0;

  return {
    avgDurationMins,
    peakHour,
    peakDay,
    currentStreak,
    longestStreak: maxStreak,
    totalSessions: sessions.length,
    totalHours,
    hourlyDistribution,
    weeklyDistribution,
    weeklyTrendPct,
    thisWeekAvgMins,
    lastWeekAvgMins,
  };
}

/** Get human-readable label for hour (e.g. "2 PM") */
export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

/** Get day name from day-of-week index */
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
