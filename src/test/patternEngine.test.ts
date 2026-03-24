import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computePatterns,
  formatHour,
  DAY_NAMES,
} from "@/lib/patternEngine";
import type { FocusSession } from "@/lib/sessionManager";

/** Helper: create a session at a specific date/time */
function makeSession(
  dateStr: string,
  hourOfDay: number,
  durationMins: number
): FocusSession {
  const d = new Date(dateStr);
  d.setHours(hourOfDay, 0, 0, 0);
  const startTime = d.getTime();
  const durationMs = durationMins * 60 * 1000;
  return { id: Math.random(), startTime, endTime: startTime + durationMs, durationMs };
}

describe("patternEngine", () => {
  it("returns zeros for empty sessions", () => {
    const p = computePatterns([]);
    expect(p.totalSessions).toBe(0);
    expect(p.avgDurationMins).toBe(0);
    expect(p.peakHour).toBeNull();
    expect(p.peakDay).toBeNull();
    expect(p.currentStreak).toBe(0);
    expect(p.longestStreak).toBe(0);
    expect(p.hourlyDistribution).toHaveLength(24);
    expect(p.weeklyDistribution).toHaveLength(7);
  });

  it("computes averageDuration correctly", () => {
    const sessions = [
      makeSession("2025-01-01", 10, 30),
      makeSession("2025-01-02", 10, 50),
    ];
    const p = computePatterns(sessions);
    expect(p.avgDurationMins).toBe(40);
    expect(p.totalSessions).toBe(2);
  });

  it("detects peakHour from distribution", () => {
    const sessions = [
      makeSession("2025-01-01", 14, 60),
      makeSession("2025-01-02", 14, 60),
      makeSession("2025-01-02", 9, 20),
    ];
    const p = computePatterns(sessions);
    expect(p.peakHour).toBe(14);
  });

  it("accumulates hourlyDistribution correctly", () => {
    const sessions = [
      makeSession("2025-01-01", 10, 30),
      makeSession("2025-01-02", 10, 30),
    ];
    const p = computePatterns(sessions);
    expect(p.hourlyDistribution[10]).toBeCloseTo(60, 0);
  });

  it("counts totalHours correctly", () => {
    const sessions = [makeSession("2025-01-01", 10, 90)];
    const p = computePatterns(sessions);
    expect(p.totalHours).toBe(1.5);
  });

  it("computes longestStreak correctly for consecutive days", () => {
    // Use dates far in the past so they don't affect currentStreak (which checks today)
    const sessions = [
      makeSession("2020-03-01", 10, 30),
      makeSession("2020-03-02", 10, 30),
      makeSession("2020-03-03", 10, 30),
      makeSession("2020-03-05", 10, 30), // gap
    ];
    const p = computePatterns(sessions);
    expect(p.longestStreak).toBe(3);
  });

  it("currentStreak is 0 when no recent sessions", () => {
    const sessions = [makeSession("2020-01-01", 10, 30)];
    const p = computePatterns(sessions);
    expect(p.currentStreak).toBe(0);
  });
});

describe("formatHour", () => {
  it("formats midnight as 12 AM", () => {
    expect(formatHour(0)).toBe("12 AM");
  });
  it("formats noon as 12 PM", () => {
    expect(formatHour(12)).toBe("12 PM");
  });
  it("formats 9 as 9 AM", () => {
    expect(formatHour(9)).toBe("9 AM");
  });
  it("formats 14 as 2 PM", () => {
    expect(formatHour(14)).toBe("2 PM");
  });
});

describe("DAY_NAMES", () => {
  it("has 7 entries", () => {
    expect(DAY_NAMES).toHaveLength(7);
    expect(DAY_NAMES[0]).toBe("Sun");
    expect(DAY_NAMES[6]).toBe("Sat");
  });
});
