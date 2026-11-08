import { PHYSICS, FRAME_MS, MAX_FRAME_SCALE } from "./constants";
import type { Velocity, Position, CharRect } from "./types";

// Movement multiplier for a frame: 1 at 60Hz, 0.5 at 120Hz, etc.
// Returns 1 for the first frame of a loop (no previous timestamp).
export const getFrameScale = (now: number, last: number | null): number => {
  if (last === null) return 1;
  return Math.min(Math.max((now - last) / FRAME_MS, 0), MAX_FRAME_SCALE);
};

// Clamp velocity to max and min speed
export const clampVelocity = (
  velocity: Velocity,
  maxSpeed = PHYSICS.MAX_SPEED,
  minSpeed = PHYSICS.MIN_SPEED
): Velocity => {
  const currentSpeed = Math.sqrt(
    velocity.vx * velocity.vx + velocity.vy * velocity.vy
  );

  if (currentSpeed === 0) return velocity;

  if (currentSpeed > maxSpeed) {
    const scale = maxSpeed / currentSpeed;
    return { vx: velocity.vx * scale, vy: velocity.vy * scale };
  }

  if (currentSpeed < minSpeed) {
    const scale = minSpeed / currentSpeed;
    return { vx: velocity.vx * scale, vy: velocity.vy * scale };
  }

  return velocity;
};

// Calculate deflection angle and speed
export const calculateDeflection = (
  ballPos: Position,
  targetPos: Position,
  currentVelocity: Velocity
): Velocity => {
  const dx = ballPos.x - targetPos.x;
  const dy = ballPos.y - targetPos.y;
  const angle = Math.atan2(dy, dx);
  const speed = Math.sqrt(
    currentVelocity.vx * currentVelocity.vx + currentVelocity.vy * currentVelocity.vy
  );

  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
};

// Check collision between ball and character
export const checkCollision = (
  ballPos: Position,
  ballSize: number,
  charRect: CharRect,
  screenWidth: number,
  screenHeight: number
): boolean => {
  const screenCenterX = screenWidth / 2;
  const screenCenterY = screenHeight / 2;

  const charCenterX = charRect.left + charRect.width / 2 - screenCenterX;
  const charCenterY = charRect.top + charRect.height / 2 - screenCenterY;

  const dx = ballPos.x - charCenterX;
  const dy = ballPos.y - charCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const charRadius = Math.max(charRect.width, charRect.height) / 2;

  return distance < ballSize / 2 + charRadius;
};
