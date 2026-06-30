import { useRef, useCallback } from "react";
import type { Position, Velocity, BallBounds, BatBounds } from "../types";
import { getBoundaries, getBatY, getResponsiveValues, PHYSICS } from "../constants";
import { clampVelocity, calculateDeflection, checkCollision } from "../utils";

interface PhysicsEngineProps {
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  charHit: React.RefObject<boolean[]>;
  charVelocities: React.RefObject<{ vx: number; vy: number; vr: number }[]>;
  charPositions: React.RefObject<{ x: number; y: number; rotation: number }[]>;
  batPositionRef: React.RefObject<number>;
}

export const usePhysicsEngine = ({
  charRefs,
  charHit,
  charVelocities,
  charPositions,
  batPositionRef,
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
      }

      // Apply transform
      charEl.style.transform = `translate(${charPositions.current[i].x}px, ${charPositions.current[i].y}px)`;
    });
  }, [charRefs, charVelocities, charPositions]);

  const checkBatCollision = useCallback((
    ballBounds: BallBounds,
    batBounds: BatBounds,
    currentPos: Position,
    currentVel: Velocity
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
  }, [batPositionRef]);

  const checkCharacterCollisions = useCallback((
    currentPos: Position,
    currentVel: Velocity
  ): Velocity => {
    const { ballSize, screenWidth, screenHeight } = getResponsiveValues();
    let newVel = { ...currentVel };

    charRefs.current.forEach((charEl, i) => {
      if (!charEl || charHit.current[i]) return;

      const charRect = charEl.getBoundingClientRect();
      
      if (checkCollision(currentPos, ballSize, charRect, screenWidth, screenHeight)) {
        // Mark as hit and make character fall
        charHit.current[i] = true;
        charVelocities.current[i].vy = 2;

        // Deflect ball
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        const charCenterX = charRect.left + charRect.width / 2 - screenCenterX;
        const charCenterY = charRect.top + charRect.height / 2 - screenCenterY;
        
        newVel = calculateDeflection(
          currentPos,
          { x: charCenterX, y: charCenterY },
          currentVel
        );
      }
    });

    return newVel;
  }, [charRefs, charHit, charVelocities]);

  const checkBoundaryCollisions = useCallback((
    pos: Position,
    vel: Velocity
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
  }, []);

  return {
    animationFrame,
    ballPosition,
    ballVelocity,
    updateCharacterPhysics,
    checkBatCollision,
    checkCharacterCollisions,
    checkBoundaryCollisions,
  };
};
