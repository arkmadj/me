import { afterEach, describe, expect, it, vi } from "vitest";
import { LEADERBOARD_SIZE } from "@shared/leaderboard";
import type { LeaderboardEntry } from "@shared/leaderboard";
import { qualifies, readPlayerName, savePlayerName } from "./leaderboard";

const entry = (score: number, durationMs = 10_000): LeaderboardEntry => ({
  name: "p",
  score,
  durationMs,
  createdAt: 0,
});

// A full board sorted the way the server returns it, lowest entry last
const fullBoard = (lastScore: number, lastDuration = 10_000) => [
  ...Array.from({ length: LEADERBOARD_SIZE - 1 }, () => entry(300)),
  entry(lastScore, lastDuration),
];

describe("qualifies", () => {
  it("never qualifies a zero or negative score", () => {
    expect(qualifies([], 0, 1_000)).toBe(false);
    expect(qualifies([], -5, 1_000)).toBe(false);
  });

  it("qualifies any positive score while the board has room", () => {
    expect(qualifies([], 5, 1_000)).toBe(true);
    expect(qualifies([entry(300)], 5, 1_000)).toBe(true);
  });

  it("on a full board, needs to beat the last entry", () => {
    expect(qualifies(fullBoard(100), 105, 99_999)).toBe(true);
    expect(qualifies(fullBoard(100), 95, 1)).toBe(false);
  });

  it("breaks score ties on the faster run", () => {
    expect(qualifies(fullBoard(100, 10_000), 100, 9_999)).toBe(true);
    expect(qualifies(fullBoard(100, 10_000), 100, 10_000)).toBe(false);
    expect(qualifies(fullBoard(100, 10_000), 100, 10_001)).toBe(false);
  });
});

describe("player name storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a normalised name", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    });
    expect(readPlayerName()).toBe("");
    savePlayerName("  Ahmad   J  ");
    expect(readPlayerName()).toBe("Ahmad J");
  });

  it("fails quietly when storage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readPlayerName()).toBe("");
    expect(() => savePlayerName("Ahmad")).not.toThrow();
  });
});
