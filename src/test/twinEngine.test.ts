import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  xpForLevel,
  totalXpForLevel,
  sessionXp,
  levelFromXp,
  levelProgress,
  applySession,
  loadTwinState,
  saveTwinState,
  resetTwinState,
  type TwinState,
} from "@/lib/twinEngine";

const BASE_STATE: TwinState = {
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

describe("twinEngine", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("xpForLevel", () => {
    it("level 1 requires 50 XP", () => {
      expect(xpForLevel(1)).toBe(50);
    });
    it("higher levels require more XP", () => {
      expect(xpForLevel(5)).toBeGreaterThan(xpForLevel(2));
    });
  });

  describe("sessionXp", () => {
    it("returns at least 5 XP", () => {
      expect(sessionXp(1)).toBeGreaterThanOrEqual(5);
    });
    it("longer sessions give more XP", () => {
      expect(sessionXp(60)).toBeGreaterThan(sessionXp(10));
    });
    it("short session still gives 5 XP minimum", () => {
      expect(sessionXp(0)).toBe(5);
    });
  });

  describe("levelFromXp", () => {
    it("0 XP = level 1", () => {
      expect(levelFromXp(0)).toBe(1);
    });
    it("enough XP for level 2", () => {
      // Give more than level 1 threshold
      const xp = xpForLevel(1) + 1;
      expect(levelFromXp(xp)).toBeGreaterThanOrEqual(2);
    });
  });

  describe("levelProgress", () => {
    it("0% progress at start of level", () => {
      const state = { ...BASE_STATE, xp: 0, level: 1 };
      expect(levelProgress(state)).toBe(0);
    });
    it("returns a value between 0 and 1", () => {
      const state = { ...BASE_STATE, xp: 25, level: 1 };
      const p = levelProgress(state);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  });

  describe("applySession", () => {
    it("increases XP", () => {
      const result = applySession(BASE_STATE, 30, 1);
      expect(result.newState.xp).toBeGreaterThan(0);
      expect(result.xpGained).toBeGreaterThan(0);
    });

    it("increments totalSessions", () => {
      const result = applySession(BASE_STATE, 30, 1);
      expect(result.newState.totalSessions).toBe(1);
    });

    it("increments totalFocusMins", () => {
      const result = applySession(BASE_STATE, 30, 1);
      expect(result.newState.totalFocusMins).toBe(30);
    });

    it("awards bonus XP for streaks >= 7", () => {
      const r7 = applySession(BASE_STATE, 30, 7);
      const r1 = applySession(BASE_STATE, 30, 1);
      expect(r7.xpGained).toBeGreaterThan(r1.xpGained);
    });

    it("unlocks excited mood at level 3", () => {
      // Give enough XP to reach level 3
      let state = { ...BASE_STATE };
      for (let i = 0; i < 5; i++) {
        const res = applySession(state, 60, i + 1);
        state = res.newState;
        if (res.leveledUp && res.newLevel >= 3) {
          expect(state.unlockedMoods).toContain("excited");
          break;
        }
      }
    });
  });

  describe("loadTwinState / saveTwinState / resetTwinState", () => {
    it("returns default state when nothing saved", () => {
      const s = loadTwinState();
      expect(s.level).toBe(1);
      expect(s.xp).toBe(0);
    });

    it("persists and loads state correctly", () => {
      const modified = { ...BASE_STATE, xp: 999, level: 5 };
      saveTwinState(modified);
      const loaded = loadTwinState();
      expect(loaded.xp).toBe(999);
      expect(loaded.level).toBe(5);
    });

    it("resetTwinState removes saved state", () => {
      saveTwinState({ ...BASE_STATE, xp: 500 });
      resetTwinState();
      const s = loadTwinState();
      expect(s.xp).toBe(0);
    });
  });
});
