import { useRef, useCallback, useEffect } from "react";
import type { Position, Velocity, BallBounds, BatBounds, CharRect } from "../types";
import {
  getBoundaries,
  getBatY,
  getResponsiveValues,
  PHYSICS,
} from "../constants";
import { clampVelocity, calculateDeflection, checkCollision } from "../utils";

interface PhysicsEngineProps {
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  charHit: React.RefObject<boolean[]>;
  charLanded: React.RefObject<boolean[]>;
  charVelocities: React.RefObject<{ vx: number; vy: number; vr: number }[]>;
  charPositions: React.RefObject<{ x: number; y: number; rotation: number }[]>;
  batPositionRef: React.RefObject<number>;
  onCharacterHit?: (index: number) => void;
  onCharacterHitBat?: (index: number) => void;
  onCharacterHitBottom?: () => void;
}

export const usePhysicsEngine = ({
  charRefs,
  charHit,
  charLanded,
  charVelocities,
  charPositions,
  batPositionRef,
  onCharacterHit,
  onCharacterHitBat,
  onCharacterHitBottom,
}: PhysicsEngineProps) => {
  const animationFrame = useRef<number | null>(null);
  const ballPosition = useRef<Position>({ x: 0, y: 0 });
  const ballVelocity = useRef<Velocity>({ vx: 0, vy: 0 });

  // Each character's layout box with no transform applied, measured once and
  // reused every frame. Reading getBoundingClientRect() in the loop right after
  // writing style.transform forces a synchronous layout per character per frame.
  const baseRects = useRef<(CharRect | null)[] | null>(null);

  // Viewport changes move the letters, so drop the cache and re-measure lazily
  useEffect(() => {
    const invalidate = () => {
      baseRects.current = null;
    };
    window.addEventListener("resize", invalidate);
    window.addEventListener("scroll", invalidate, { passive: true });
    return () => {
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("scroll", invalidate);
    };
  }, []);

  // Measure all characters in one batch (a single layout), subtracting the
  // translate we applied so the cache holds the untransformed position
  const measureBaseRects = useCallback(() => {
    baseRects.current = charRefs.current.map((charEl, i) => {
      if (!charEl) return null;
      const rect = charEl.getBoundingClientRect();
      const pos = charPositions.current[i] ?? { x: 0, y: 0 };
      return {
        left: rect.left - pos.x,
        top: rect.top - pos.y,
        width: rect.width,
        height: rect.height,
      };
    });
  }, [charRefs, charPositions]);

  // Current box of a character: cached base box offset by its tracked position
  const getCharRect = useCallback(
    (i: number): CharRect | null => {
      if (!baseRects.current || baseRects.current.length !== charRefs.current.length) {
        measureBaseRects();
      }
      const base = baseRects.current?.[i];
      if (!base) return null;
      const pos = charPositions.current[i];
      return {
        left: base.left + pos.x,
        top: base.top + pos.y,
        width: base.width,
        height: base.height,
      };
    },
    [charRefs, charPositions, measureBaseRects],
  );

  const updateCharacterPhysics = useCallback((frameScale = 1) => {
    const { screenHeight } = getResponsiveValues();

    charRefs.current.forEach((charEl, i) => {
      if (!charEl || charVelocities.current[i].vy <= 0) return;

      // Apply gravity
      charVelocities.current[i].vy += PHYSICS.GRAVITY * frameScale;

      // Update position
      charPositions.current[i].y += charVelocities.current[i].vy * frameScale;

      // Check if hit the ground
      const charMaxY = screenHeight;
      if (charPositions.current[i].y >= charMaxY) {
        charPositions.current[i].y = charMaxY;
        charVelocities.current[i].vy = 0;

        // Call callback only once per character
        if (!charLanded.current[i]) {
          charLanded.current[i] = true;
          if (onCharacterHitBottom) {
            onCharacterHitBottom();
          }
        }
      }

      // Apply transform
      charEl.style.transform = `translate(${charPositions.current[i].x}px, ${charPositions.current[i].y}px)`;
    });
  }, [charRefs, charLanded, charVelocities, charPositions, onCharacterHitBottom]);

  const checkBatCollision = useCallback(
    (
      ballBounds: BallBounds,
      batBounds: BatBounds,
      currentPos: Position,
      currentVel: Velocity,
    ): { collision: boolean; newY?: number; newVelocity?: Velocity } => {
      if (
        ballBounds.bottom >= batBounds.top &&
        ballBounds.top <= batBounds.bottom &&
        ballBounds.right >= batBounds.left &&
        ballBounds.left <= batBounds.right &&
        currentVel.vy > 0
      ) {
        const { batWidth } = getResponsiveValues();
        const { ballSize, screenHeight } = getResponsiveValues();
        const batY = getBatY(screenHeight, 24);

        // Position ball just above bat
        const newY = batY - ballSize / 2;

        // Reverse Y velocity
        let newVx = currentVel.vx;
        const newVy = -Math.abs(currentVel.vy);

        // Add horizontal velocity based on hit position
        const hitOffset = currentPos.x - batPositionRef.current;
        const maxOffset = batWidth / 2;
        const angleFactor = hitOffset / maxOffset;
        newVx += angleFactor * PHYSICS.BAT_ANGLE_FACTOR;

        const clamped = clampVelocity({ vx: newVx, vy: newVy });

        return {
          collision: true,
          newY,
          newVelocity: clamped,
        };
      }

      return { collision: false };
    },
    [batPositionRef],
  );

  const checkCharacterBatCollisions = useCallback(() => {
    const { batWidth, screenHeight } = getResponsiveValues();
    const batHeight = 24;
    const batY = getBatY(screenHeight, batHeight);

    // Calculate bat bounds
    const batBounds = {
      left: batPositionRef.current - batWidth / 2,
      right: batPositionRef.current + batWidth / 2,
      top: batY - batHeight / 2,
      bottom: batY + batHeight / 2,
    };

    charRefs.current.forEach((charEl, i) => {
      // Only check characters that are falling (hit and have velocity)
      if (!charEl || !charHit.current[i] || charVelocities.current[i].vy <= 0)
        return;

      const charRect = getCharRect(i);
      if (!charRect) return;
      const { screenWidth } = getResponsiveValues();
      const screenCenterX = screenWidth / 2;
      const screenCenterY = screenHeight / 2;

      // Convert character bounds to screen-centered coordinates
      const charCenterX = charRect.left + charRect.width / 2 - screenCenterX;
      const charCenterY = charRect.top + charRect.height / 2 - screenCenterY;
      const charHalfHeight = charRect.height / 2;
      const charHalfWidth = charRect.width / 2;

      const charBottom = charCenterY + charHalfHeight;
      const charTop = charCenterY - charHalfHeight;
      const charLeft = charCenterX - charHalfWidth;
      const charRight = charCenterX + charHalfWidth;

      // Check for collision with bat
      if (
        charBottom >= batBounds.top &&
        charTop <= batBounds.bottom &&
        charRight >= batBounds.left &&
        charLeft <= batBounds.right
      ) {
        // Only call callback once per character
        if (!charLanded.current[i]) {
          charLanded.current[i] = true;
          if (onCharacterHitBat) {
            onCharacterHitBat(i);
          }
        }
        // Stop character on top of bat
        charPositions.current[i].y = batY - batHeight / 2 - screenHeight;
        charVelocities.current[i].vy = 0;

        // Update visual position
        charEl.style.transform = `translate(${charPositions.current[i].x}px, ${charPositions.current[i].y}px)`;
      }
    });
  }, [batPositionRef, charRefs, charHit, charLanded, charVelocities, charPositions, getCharRect, onCharacterHitBat]);

  const checkCharacterCollisions = useCallback(
    (currentPos: Position, currentVel: Velocity): Velocity => {
      const { ballSize, screenWidth, screenHeight } = getResponsiveValues();
      let newVel = { ...currentVel };

      charRefs.current.forEach((charEl, i) => {
        if (!charEl || charHit.current[i]) return;

        const charRect = getCharRect(i);
        if (!charRect) return;

        if (
          checkCollision(
            currentPos,
            ballSize,
            charRect,
            screenWidth,
            screenHeight,
          )
        ) {
          // Mark as hit and make character fall
          charHit.current[i] = true;
          charVelocities.current[i].vy = 2;

          // Increment score
          if (onCharacterHit) {
            onCharacterHit(i);
          }

          // Deflect ball
          const screenCenterX = screenWidth / 2;
          const screenCenterY = screenHeight / 2;
          const charCenterX =
            charRect.left + charRect.width / 2 - screenCenterX;
          const charCenterY =
            charRect.top + charRect.height / 2 - screenCenterY;

          newVel = calculateDeflection(
            currentPos,
            { x: charCenterX, y: charCenterY },
            currentVel,
          );
        }
      });

      return newVel;
    },
    [charRefs, charHit, charVelocities, getCharRect, onCharacterHit],
  );

  const checkBoundaryCollisions = useCallback(
    (
      pos: Position,
      vel: Velocity,
    ): { newPos: Position; newVel: Velocity; hitBottom: boolean; hitWall: boolean } => {
      const { ballSize, screenWidth, screenHeight } = getResponsiveValues();
      const boundaries = getBoundaries(screenWidth, screenHeight, ballSize);

      let newX = pos.x;
      let newY = pos.y;
      let newVx = vel.vx;
      let newVy = vel.vy;
      let hitBottom = false;
      let hitWall = false;

      if (newX > boundaries.maxX) {
        newX = boundaries.maxX;
        newVx = -Math.abs(newVx);
        hitWall = true;
      } else if (newX < boundaries.minX) {
        newX = boundaries.minX;
        newVx = Math.abs(newVx);
        hitWall = true;
      }

      if (newY > boundaries.maxY) {
        newY = boundaries.maxY;
        newVy = -Math.abs(newVy);
        hitBottom = true; // Ball touched the bottom of the screen
      } else if (newY < boundaries.minY) {
        newY = boundaries.minY;
        newVy = Math.abs(newVy);
        hitWall = true;
      }

      return {
        newPos: { x: newX, y: newY },
        newVel: { vx: newVx, vy: newVy },
        hitBottom,
        hitWall,
      };
    },
    [],
  );

  return {
    animationFrame,
    ballPosition,
    ballVelocity,
    updateCharacterPhysics,
    checkBatCollision,
    checkCharacterBatCollisions,
    checkCharacterCollisions,
    checkBoundaryCollisions,
  };
};
