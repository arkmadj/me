"use no memo";
import { useCallback } from "react";
import { createDraggable } from "animejs";
import type { Velocity, Position } from "../types";
import { getResponsiveValues, getBatY, PHYSICS } from "../constants";
import { clampVelocity } from "../utils";
import { usePhysicsEngine } from "./usePhysicsEngine";

interface UseBallAnimationProps {
  ballRef: React.RefObject<HTMLDivElement | null>;
  ballDraggable: React.RefObject<ReturnType<typeof createDraggable> | null>;
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  charHit: React.RefObject<boolean[]>;
  charVelocities: React.RefObject<{ vx: number; vy: number; vr: number }[]>;
  charPositions: React.RefObject<{ x: number; y: number; rotation: number }[]>;
  batPositionRef: React.RefObject<number>;
  gameStateRef: React.RefObject<string>;
  welcomeAnimationComplete: React.RefObject<boolean>;
  onBallHitBottom?: () => void;
  onCharacterHit?: () => void;
  onCharacterHitBat?: () => void;
}

export const useBallAnimation = ({
  ballRef,
  ballDraggable,
  charRefs,
  charHit,
  charVelocities,
  charPositions,
  batPositionRef,
  gameStateRef,
  welcomeAnimationComplete,
  onBallHitBottom,
  onCharacterHit,
  onCharacterHitBat,
}: UseBallAnimationProps) => {
  const physics = usePhysicsEngine({
    charRefs,
    charHit,
    charVelocities,
    charPositions,
    batPositionRef,
    onCharacterHit,
    onCharacterHitBat,
  });

  // Destructure physics properties
  const {
    animationFrame: animationFrameRef,
    ballPosition: ballPositionRef,
    ballVelocity: ballVelocityRef,
    checkBatCollision,
    checkCharacterBatCollisions,
    checkCharacterCollisions,
    updateCharacterPhysics,
    checkBoundaryCollisions,
  } = physics;

  const animateBall = useCallback((
    initialPos: Position,
    initialVel: Velocity
  ) => {
    let currentX = initialPos.x;
    let currentY = initialPos.y;
    let velocityX = initialVel.vx;
    let velocityY = initialVel.vy;

    const { ballSize, batWidth, screenHeight } = getResponsiveValues();
    const batHeight = 24;
    const batY = getBatY(screenHeight, batHeight);

    const animateBounce = () => {
      // Check if game is paused
      if (gameStateRef.current === "paused") {
        ballPositionRef.current = { x: currentX, y: currentY };
        ballVelocityRef.current = { vx: velocityX, vy: velocityY };
        animationFrameRef.current = requestAnimationFrame(animateBounce);
        return;
      }

      // Update position
      currentX += velocityX;
      currentY += velocityY;

      // Calculate ball bounds
      const ballBounds = {
        bottom: currentY + ballSize / 2,
        top: currentY - ballSize / 2,
        left: currentX - ballSize / 2,
        right: currentX + ballSize / 2,
      };

      // Calculate bat bounds
      const batBounds = {
        left: batPositionRef.current - batWidth / 2,
        right: batPositionRef.current + batWidth / 2,
        top: batY - batHeight / 2,
        bottom: batY + batHeight / 2,
      };

      // Check bat collision
      const batCollision = checkBatCollision(
        ballBounds,
        batBounds,
        { x: currentX, y: currentY },
        { vx: velocityX, vy: velocityY }
      );

      if (batCollision.collision && batCollision.newY && batCollision.newVelocity) {
        currentY = batCollision.newY;
        velocityX = batCollision.newVelocity.vx;
        velocityY = batCollision.newVelocity.vy;
      }

      // Check character collisions
      const charCollisionVel = checkCharacterCollisions(
        { x: currentX, y: currentY },
        { vx: velocityX, vy: velocityY }
      );
      velocityX = charCollisionVel.vx;
      velocityY = charCollisionVel.vy;

      // Update character physics
      updateCharacterPhysics();

      // Check character-bat collisions
      checkCharacterBatCollisions();

      // Check boundary collisions
      const { newPos, newVel: boundaryVel, hitBottom } = checkBoundaryCollisions(
        { x: currentX, y: currentY },
        { vx: velocityX, vy: velocityY }
      );
      currentX = newPos.x;
      currentY = newPos.y;
      velocityX = boundaryVel.vx;
      velocityY = boundaryVel.vy;

      // Check if ball hit the bottom
      if (hitBottom) {
        // Stop the animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Call the callback to handle life loss and reset
        if (onBallHitBottom) {
          onBallHitBottom();
        }
        return;
      }

      // Store current state
      ballPositionRef.current = { x: currentX, y: currentY };
      ballVelocityRef.current = { vx: velocityX, vy: velocityY };

      // Update ball visual position
      if (ballRef.current && ballDraggable.current) {
        ballRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
        ballDraggable.current.x = currentX;
        ballDraggable.current.y = currentY;
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animateBounce);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animateBounce);
  }, [
    animationFrameRef,
    ballPositionRef,
    ballVelocityRef,
    checkBatCollision,
    checkCharacterBatCollisions,
    checkCharacterCollisions,
    updateCharacterPhysics,
    checkBoundaryCollisions,
    ballRef,
    ballDraggable,
    batPositionRef,
    gameStateRef,
    onBallHitBottom,
  ]);

  const calculateLaunchVelocity = useCallback((
    dragStart: Position,
    dragEnd: Position
  ): Velocity => {
    const dragX = dragEnd.x - dragStart.x;
    const dragY = dragEnd.y - dragStart.y;

    // Calculate catapult velocity
    const velocityX = -dragX * PHYSICS.VELOCITY_MULTIPLIER;
    const velocityY = -dragY * PHYSICS.VELOCITY_MULTIPLIER;

    return clampVelocity({ vx: velocityX, vy: velocityY });
  }, []);

  const resetBallAnimation = () => {
    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Reset ball position and velocity
    ballPositionRef.current = { x: 0, y: 0 };
    ballVelocityRef.current = { vx: 0, vy: 0 };

    // Reset ball visual position
    const ball = ballRef.current;
    const draggable = ballDraggable.current;

    if (ball && draggable) {
      ball.style.transform = 'translate(0px, 0px)';
      // Note: Mutating draggable.x and draggable.y is the intended anime.js API.
      // Using Object.assign to satisfy React Compiler while maintaining intended behavior.
      Object.assign(draggable, { x: 0, y: 0 });

      // Only enable dragging if welcome animation has completed
      if (welcomeAnimationComplete.current) {
        draggable.enable();
      }
    }
  };

  return {
    animateBall,
    calculateLaunchVelocity,
    resetBallAnimation,
    animationFrame: animationFrameRef,
  };
};
