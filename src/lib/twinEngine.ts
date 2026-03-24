/**
 * Twin Engine — XP, leveling, mood management
 * Manages the Evo Twin's evolution based on focus activity.
 * State persisted to localStorage for fast synchronous reads.
 */

export interface TwinState {
  xp: number;
  level: number;
  name: string;
  totalSessions: number;
  totalFocusMins: number;
  lastSessionDate: number | null; // timestamp ms
  streakDays: number;
  unlockedMoods: string[];
  personalityTraits: string[];
}

const STORAGE_KEY = "focus-twin:state";

const DEFAULT_STATE: TwinState = {
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

/** XP required to reach the next level */
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.4));
}

/** Total XP required to reach a given level from 0 */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

/** XP earned for a session of given duration */
export function sessionXp(durationMins: number): number {
  return Math.max(5, Math.round(durationMins * 1.5));
}

/** Load twin state from localStorage */
export function loadTwinState(): TwinState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/** Save twin state to localStorage */
export function saveTwinState(state: TwinState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) { /* storage unavailable */ }
}

/** Reset twin state (for onboarding or debug) */
export function resetTwinState(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* storage unavailable */ }
}

/** Compute level from total XP */
export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 99 && xp >= totalXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

/** Returns progress 0–1 within current level */
export function levelProgress(state: TwinState): number {
  const needed = xpForLevel(state.level);
  const base = totalXpForLevel(state.level);
  const progress = state.xp - base;
  return Math.min(1, Math.max(0, progress / needed));
}

export interface LevelUpResult {
  newState: TwinState;
  leveledUp: boolean;
  newLevel: number;
  xpGained: number;
  unlockedMoods: string[];
  unlockedTraits: string[];
}

const MOOD_UNLOCKS: Record<number, string[]> = {
  3: ["excited"],
  5: ["thinking"],
  8: ["sleepy"],
  12: ["surprised"],
};

const TRAIT_UNLOCKS: Record<number, string[]> = {
  5: ["encouraging"],
  10: ["analytical"],
  15: ["predictive"],
  20: ["philosophical"],
};

/** Apply a completed session to the twin state, returning updated state + level-up info */
export function applySession(
  state: TwinState,
  durationMins: number,
  streak: number
): LevelUpResult {
  const xpGained = sessionXp(durationMins) + (streak >= 7 ? 10 : streak >= 3 ? 5 : 0);
  const prevLevel = state.level;

  const newXp = state.xp + xpGained;
  const newLevel = levelFromXp(newXp);
  const leveledUp = newLevel > prevLevel;

  // Unlock moods
  const unlockedMoods: string[] = [];
  for (let l = prevLevel + 1; l <= newLevel; l++) {
    if (MOOD_UNLOCKS[l]) {
      for (const m of MOOD_UNLOCKS[l]) {
        if (!state.unlockedMoods.includes(m)) unlockedMoods.push(m);
      }
    }
  }

  // Unlock traits
  const unlockedTraits: string[] = [];
  for (let l = prevLevel + 1; l <= newLevel; l++) {
    if (TRAIT_UNLOCKS[l]) {
      for (const t of TRAIT_UNLOCKS[l]) {
        if (!state.personalityTraits.includes(t)) unlockedTraits.push(t);
      }
    }
  }

  const newState: TwinState = {
    ...state,
    xp: newXp,
    level: newLevel,
    totalSessions: state.totalSessions + 1,
    totalFocusMins: state.totalFocusMins + durationMins,
    lastSessionDate: Date.now(),
    streakDays: streak,
    unlockedMoods: [...state.unlockedMoods, ...unlockedMoods],
    personalityTraits: [...state.personalityTraits, ...unlockedTraits],
  };

  return { newState, leveledUp, newLevel, xpGained, unlockedMoods, unlockedTraits };
}

/** Pick a fitting mood for the twin based on current context */
export function pickTwinMood(
  state: TwinState,
  context: "dashboard" | "focusing" | "celebrating" | "idle"
): string {
  const available = state.unlockedMoods;
  if (context === "focusing") return available.includes("thinking") ? "thinking" : "curious";
  if (context === "celebrating") return available.includes("excited") ? "excited" : "happy";
  if (context === "idle") return available.includes("sleepy") ? "sleepy" : "idle";
  // dashboard — pick based on time of day
  const h = new Date().getHours();
  if (h < 8 || h >= 22) return available.includes("sleepy") ? "sleepy" : "idle";
  if (state.streakDays >= 3) return available.includes("excited") ? "excited" : "happy";
  return "curious";
}
