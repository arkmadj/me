import { describe, expect, it } from "vitest";
import { FRAME_MS, MAX_FRAME_SCALE, PHYSICS, getBatY, getBoundaries, BAT_BOTTOM_OFFSET } from "./constants";
import { calculateDeflection, checkCollision, clampVelocity, getFrameScale } from "./utils";

const speed = ({ vx, vy }: { vx: number; vy: number }) => Math.hypot(vx, vy);

describe("getFrameScale", () => {
  it("is 1 on the first frame", () => {
    expect(getFrameScale(1234, null)).toBe(1);
  });

  it("is 1 at 60Hz and 0.5 at 120Hz", () => {
    expect(getFrameScale(FRAME_MS, 0)).toBeCloseTo(1);
    expect(getFrameScale(FRAME_MS / 2, 0)).toBeCloseTo(0.5);
  });

  it("never goes negative", () => {
    expect(getFrameScale(0, 100)).toBe(0);
  });

  it("caps long gaps", () => {
    expect(getFrameScale(10_000, 0)).toBe(MAX_FRAME_SCALE);
  });
});

describe("clampVelocity", () => {
  it("leaves a stationary ball alone", () => {
    const v = { vx: 0, vy: 0 };
    expect(clampVelocity(v)).toBe(v);
  });

  it("leaves in-range speeds unchanged", () => {
    const v = { vx: 6, vy: 6 }; // ~8.49
    expect(clampVelocity(v)).toBe(v);
  });

  it("scales fast balls down to max speed, keeping direction", () => {
    const result = clampVelocity({ vx: 30, vy: -40 });
    expect(speed(result)).toBeCloseTo(PHYSICS.MAX_SPEED);
    expect(result.vx / result.vy).toBeCloseTo(30 / -40);
  });

  it("scales slow balls up to min speed, keeping direction", () => {
    const result = clampVelocity({ vx: -3, vy: 4 });
    expect(speed(result)).toBeCloseTo(PHYSICS.MIN_SPEED);
    expect(result.vx / result.vy).toBeCloseTo(-3 / 4);
  });

  it("respects custom limits", () => {
    expect(speed(clampVelocity({ vx: 10, vy: 0 }, 5, 1))).toBeCloseTo(5);
    expect(speed(clampVelocity({ vx: 0.5, vy: 0 }, 5, 1))).toBeCloseTo(1);
  });
});

describe("calculateDeflection", () => {
  it("sends the ball directly away from the target, preserving speed", () => {
    const result = calculateDeflection({ x: 0, y: 10 }, { x: 0, y: 0 }, { vx: 3, vy: -4 });
    expect(result.vx).toBeCloseTo(0);
    expect(result.vy).toBeCloseTo(5);
  });

  it("deflects diagonally when hit off-centre", () => {
    const result = calculateDeflection({ x: -1, y: -1 }, { x: 0, y: 0 }, { vx: 0, vy: 8 });
    expect(result.vx).toBeLessThan(0);
    expect(result.vy).toBeLessThan(0);
    expect(speed(result)).toBeCloseTo(8);
  });
});

describe("checkCollision", () => {
  // 20x20 char centred on screen (1000x800): its centre is (0, 0) in ball coordinates
  const char = { left: 490, top: 390, width: 20, height: 20 };

  it("detects overlap", () => {
    expect(checkCollision({ x: 0, y: 0 }, 40, char, 1000, 800)).toBe(true);
    expect(checkCollision({ x: 29, y: 0 }, 40, char, 1000, 800)).toBe(true);
  });

  it("ignores a ball just out of reach", () => {
    // touching distance is ballSize/2 + charRadius = 30, and the check is strict
    expect(checkCollision({ x: 30, y: 0 }, 40, char, 1000, 800)).toBe(false);
    expect(checkCollision({ x: 200, y: 200 }, 40, char, 1000, 800)).toBe(false);
  });

  it("uses the larger side as the char radius", () => {
    const tall = { left: 495, top: 380, width: 10, height: 40 };
    expect(checkCollision({ x: 39, y: 0 }, 40, tall, 1000, 800)).toBe(true);
  });
});

describe("getBoundaries", () => {
  it("keeps the ball fully on screen around a centred origin", () => {
    expect(getBoundaries(1000, 800, 40)).toEqual({ maxX: 480, minX: -480, maxY: 380, minY: -380 });
  });
});

describe("getBatY", () => {
  it("places the bat centre above the bottom offset", () => {
    expect(getBatY(800, 24)).toBe(400 - BAT_BOTTOM_OFFSET - 12);
  });
});
