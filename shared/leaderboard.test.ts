import { describe, expect, it } from "vitest";
import {
  MAX_SCORE,
  MIN_MS_PER_POINT,
  NAME_MAX_LENGTH,
  SCORE_STEP,
  isBlockedName,
  normalizeName,
  validateSubmission,
} from "./leaderboard";

describe("normalizeName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeName("  Ahmad \t  J  ")).toBe("Ahmad J");
  });

  it("truncates to the max length", () => {
    expect(normalizeName("a".repeat(NAME_MAX_LENGTH + 5))).toHaveLength(NAME_MAX_LENGTH);
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeName("   ")).toBe("");
  });
});

describe("isBlockedName", () => {
  it.each(["fuck", "FUCK", "xXshitXx", "fuuuck", "sh1t", "f.u.c.k", "f u c k", "b4stard"])(
    "blocks %s",
    (name) => {
      expect(isBlockedName(name)).toBe(true);
    },
  );

  it.each(["dick", "big dick", "ass", "bad_ass", "c0ck", "diiick"])("blocks whole word %s", (name) => {
    expect(isBlockedName(name)).toBe(true);
  });

  it.each(["Ahmad", "grape", "spicy", "dickens", "class", "cocktail", "Sussex", "player_1"])(
    "allows %s",
    (name) => {
      expect(isBlockedName(name)).toBe(false);
    },
  );
});

describe("validateSubmission", () => {
  const valid = { name: "Ahmad", score: 30, durationMs: 5_000 };

  it("accepts a valid submission and normalises it", () => {
    expect(validateSubmission({ name: "  Ahmad  J ", score: 30, durationMs: 5_000.6 })).toEqual({
      name: "Ahmad J",
      score: 30,
      durationMs: 5_001,
    });
  });

  it("drops unknown fields", () => {
    expect(validateSubmission({ ...valid, session: "x", extra: 1 })).toEqual(valid);
  });

  it.each([null, undefined, "str", 42])("rejects non-object body %s", (body) => {
    expect(validateSubmission(body)).toBe("Invalid body");
  });

  it("requires a name", () => {
    expect(validateSubmission({ ...valid, name: undefined })).toBe("Name is required");
    expect(validateSubmission({ ...valid, name: "   " })).toBe("Name is required");
  });

  it("rejects names with disallowed characters", () => {
    expect(validateSubmission({ ...valid, name: "<script>" })).toMatch(/may only use/);
    expect(validateSubmission({ ...valid, name: "émile" })).toMatch(/may only use/);
  });

  it("rejects blocked names", () => {
    expect(validateSubmission({ ...valid, name: "shithead" })).toBe("Please pick a different name");
  });

  it.each([
    ["zero", 0],
    ["negative", -5],
    ["non-integer", 12.5],
    ["off-step", SCORE_STEP + 1],
    ["above max", MAX_SCORE + SCORE_STEP],
    ["string", "30"],
    ["NaN", NaN],
  ])("rejects %s score", (_, score) => {
    expect(validateSubmission({ ...valid, score })).toBe("Invalid score");
  });

  it("accepts the max score with enough time", () => {
    const durationMs = MAX_SCORE * MIN_MS_PER_POINT;
    expect(validateSubmission({ ...valid, score: MAX_SCORE, durationMs })).toMatchObject({ score: MAX_SCORE });
  });

  it.each([
    ["negative", -1],
    ["infinite", Infinity],
    ["NaN", NaN],
    ["string", "5000"],
  ])("rejects %s duration", (_, durationMs) => {
    expect(validateSubmission({ ...valid, durationMs })).toBe("Invalid duration");
  });

  it("rejects runs faster than humanly possible", () => {
    const score = 150;
    expect(validateSubmission({ ...valid, score, durationMs: score * MIN_MS_PER_POINT - 1 })).toBe("Invalid duration");
    expect(validateSubmission({ ...valid, score, durationMs: score * MIN_MS_PER_POINT })).toMatchObject({ score });
  });
});
