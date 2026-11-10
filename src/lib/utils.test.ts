import { describe, expect, it } from "vitest";
import { cn, isDeepEqual } from "./utils";

describe("cn", () => {
  it("joins conditional classes", () => {
    expect(cn("a", null, undefined, { c: true, d: false })).toBe("a c");
  });

  it("lets later Tailwind classes win", () => {
    expect(cn("p-2 text-red-500", "p-4")).toBe("text-red-500 p-4");
  });
});

describe("isDeepEqual", () => {
  it("compares velocities by value", () => {
    const a = { vx: 1, vy: 2 };
    expect(isDeepEqual(a, a)).toBe(true);
    expect(isDeepEqual(a, { vx: 1, vy: 2 })).toBe(true);
    expect(isDeepEqual(a, { vx: 1, vy: 3 })).toBe(false);
  });
});
