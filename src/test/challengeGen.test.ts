import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateChallenge,
  loadTodayChallenge,
  saveChallenge,
  completeChallenge,
  getTodayChallenge,
  type DailyChallenge,
} from "@/lib/challengeGen";
import type { PatternSummary } from "@/lib/patternEngine";
import type { TwinState } from "@/lib/twinEngine";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

const EMPTY_PATTERNS: PatternSummary = {
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

const TWIN_STATE: TwinState = {
  xp: 0,
  level: 1,
  name: "Evo Twin",
  totalSessions: 0,
  totalFocusMins: 0,
  lastSessionDate: null,
  streakDays: 0,
  unlockedMoods: ["idle", "happy", "curious"],
  personalityTraits: [],
};

describe("challengeGen", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("generates a first-session challenge when no sessions", () => {
    const c = generateChallenge(EMPTY_PATTERNS, TWIN_STATE);
    expect(c.title).toBe("First Focus");
    expect(c.targetMins).toBeGreaterThan(0);
    expect(c.completed).toBe(false);
    expect(c.date).toBeTruthy();
  });

  it("generates a streak hero challenge for long streaks", () => {
    const patterns: PatternSummary = { ...EMPTY_PATTERNS, totalSessions: 20, avgDurationMins: 30 };
    const twin: TwinState = { ...TWIN_STATE, streakDays: 7 };
    const c = generateChallenge(patterns, twin);
    expect(c.title).toContain("Streak");
  });

  it("generates restart challenge when streak is 0 and has history", () => {
    const patterns: PatternSummary = { ...EMPTY_PATTERNS, totalSessions: 10, avgDurationMins: 25 };
    const twin: TwinState = { ...TWIN_STATE, streakDays: 0 };
    const c = generateChallenge(patterns, twin);
    expect(c.title).toContain("Streak");
  });

  it("has a targetMins > 0", () => {
    const c = generateChallenge(EMPTY_PATTERNS, TWIN_STATE);
    expect(c.targetMins).toBeGreaterThan(0);
  });

  it("saves and loads today's challenge", () => {
    const c = generateChallenge(EMPTY_PATTERNS, TWIN_STATE);
    const loaded = loadTodayChallenge();
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe(c.id);
  });

  it("completeChallenge marks challenge as completed", () => {
    generateChallenge(EMPTY_PATTERNS, TWIN_STATE);
    completeChallenge();
    const loaded = loadTodayChallenge();
    expect(loaded!.completed).toBe(true);
    expect(loaded!.completedAt).toBeDefined();
  });

  it("getTodayChallenge returns existing challenge if already generated today", () => {
    const first = generateChallenge(EMPTY_PATTERNS, TWIN_STATE);
    const second = getTodayChallenge(EMPTY_PATTERNS, TWIN_STATE);
    expect(second.id).toBe(first.id);
  });

  it("stale challenge is regenerated", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const stale: DailyChallenge = {
      id: "old",
      date: `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`,
      title: "Old",
      description: "Old",
      targetMins: 10,
      completed: false,
    };
    saveChallenge(stale);
    const loaded = loadTodayChallenge();
    expect(loaded).toBeNull(); // stale → null
  });
});
