import { useRef, useCallback } from "react";
import type { Position, Velocity, BallBounds, BatBounds } from "../types";
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
  onCharacterHit?: () => void;
  onCharacterHitBat?: () => void;
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

  const updateCharacterPhysics = useCallback(() => {
    const { screenHeight } = getResponsiveValues();

    charRefs.current.forEach((charEl, i) => {
      if (!charEl || charVelocities.current[i].vy <= 0) return;

      // Apply gravity
      charVelocities.current[i].vy += PHYSICS.GRAVITY;

      // Update position
      charPositions.current[i].y += charVelocities.current[i].vy;

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

      const charRect = charEl.getBoundingClientRect();
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
            onCharacterHitBat();
          }
        }
        // Stop character on top of bat
        charPositions.current[i].y = batY - batHeight / 2 - screenHeight;
        charVelocities.current[i].vy = 0;

        // Update visual position
        charEl.style.transform = `translate(${charPositions.current[i].x}px, ${charPositions.current[i].y}px)`;
      }
    });
  }, [batPositionRef, charRefs, charHit, charLanded, charVelocities, charPositions, onCharacterHitBat]);

  const checkCharacterCollisions = useCallback(
    (currentPos: Position, currentVel: Velocity): Velocity => {
      const { ballSize, screenWidth, screenHeight } = getResponsiveValues();
      let newVel = { ...currentVel };

      charRefs.current.forEach((charEl, i) => {
        if (!charEl || charHit.current[i]) return;

        const charRect = charEl.getBoundingClientRect();

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
            onCharacterHit();
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
    [charRefs, charHit, charVelocities, onCharacterHit],
  );

  const checkBoundaryCollisions = useCallback(
    (
      pos: Position,
      vel: Velocity,
    ): { newPos: Position; newVel: Velocity; hitBottom: boolean } => {
      const { ballSize, screenWidth, screenHeight } = getResponsiveValues();
      const boundaries = getBoundaries(screenWidth, screenHeight, ballSize);

      let newX = pos.x;
      let newY = pos.y;
      let newVx = vel.vx;
      let newVy = vel.vy;
      let hitBottom = false;

      if (newX > boundaries.maxX) {
        newX = boundaries.maxX;
        newVx = -Math.abs(newVx);
      } else if (newX < boundaries.minX) {
        newX = boundaries.minX;
        newVx = Math.abs(newVx);
      }

      if (newY > boundaries.maxY) {
        newY = boundaries.maxY;
        newVy = -Math.abs(newVy);
        hitBottom = true; // Ball touched the bottom of the screen
      } else if (newY < boundaries.minY) {
        newY = boundaries.minY;
        newVy = Math.abs(newVy);
      }

      return {
        newPos: { x: newX, y: newY },
        newVel: { vx: newVx, vy: newVy },
        hitBottom,
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
