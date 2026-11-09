"use no memo";
import { useCallback, useRef } from "react";
import { createDraggable } from "animejs";
import type { Velocity, Position } from "../types";
import { getResponsiveValues, getBatY, PHYSICS } from "../constants";
import { clampVelocity, getFrameScale } from "../utils";
import { usePhysicsEngine } from "./usePhysicsEngine";
import { useSound } from "@/hooks/useSound";

interface UseBallAnimationProps {
  ballRef: React.RefObject<HTMLDivElement | null>;
  ballDraggable: React.RefObject<ReturnType<typeof createDraggable> | null>;
  charRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  charHit: React.RefObject<boolean[]>;
  charLanded: React.RefObject<boolean[]>;
  charVelocities: React.RefObject<{ vx: number; vy: number; vr: number }[]>;
  charPositions: React.RefObject<{ x: number; y: number; rotation: number }[]>;
  batPositionRef: React.RefObject<number>;
  gameStateRef: React.RefObject<string>;
  welcomeAnimationComplete: React.RefObject<boolean>;
  muted?: boolean;
  onBallHitBottom?: () => void;
  onCharacterHit?: (index: number) => void;
  onCharacterHitBat?: (index: number) => void;
  onCharacterHitBottom?: () => void;
}

export const useBallAnimation = ({
  ballRef,
  ballDraggable,
  charRefs,
  charHit,
  charLanded,
  charVelocities,
  charPositions,
  batPositionRef,
  gameStateRef,
  welcomeAnimationComplete,
  muted,
  onBallHitBottom,
  onCharacterHit,
  onCharacterHitBat,
  onCharacterHitBottom,
}: UseBallAnimationProps) => {
  const { playBatHit, playWallHit } = useSound({ muted });

  const physics = usePhysicsEngine({
    charRefs,
    charHit,
    charLanded,
    charVelocities,
    charPositions,
    batPositionRef,
    onCharacterHit,
    onCharacterHitBat,
    onCharacterHitBottom,
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

  // True while the loop is stopped by a pause and should continue on resume
  const suspendedRef = useRef(false);

  const animateBall = useCallback((
    initialPos: Position,
    initialVel: Velocity
  ) => {
    let currentX = initialPos.x;
    let currentY = initialPos.y;
    let velocityX = initialVel.vx;
    let velocityY = initialVel.vy;

    const { ballSize, batWidth, batHeight, screenHeight } = getResponsiveValues();
    const batY = getBatY(screenHeight, batHeight);

    // Timestamp of the last simulated frame, for scaling movement by elapsed time
    let lastTime: number | null = null;

    const animateBounce = (now: number) => {
      // Check if game is paused, won, or over
      if (gameStateRef.current === "paused" || gameStateRef.current === "won" || gameStateRef.current === "over") {
        ballPositionRef.current = { x: currentX, y: currentY };
        ballVelocityRef.current = { vx: velocityX, vy: velocityY };

        // Stop the loop; resumeBall restarts it from the saved state
        animationFrameRef.current = null;
        suspendedRef.current = gameStateRef.current === "paused";
        return;
      }

      const frameScale = getFrameScale(now, lastTime);
      lastTime = now;

      // Update position
      currentX += velocityX * frameScale;
      currentY += velocityY * frameScale;

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

        // Play bat hit sound
        playBatHit();
      }

      // Check character collisions
      const charCollisionVel = checkCharacterCollisions(
        { x: currentX, y: currentY },
        { vx: velocityX, vy: velocityY }
      );
      velocityX = charCollisionVel.vx;
      velocityY = charCollisionVel.vy;

      // Update character physics
      updateCharacterPhysics(frameScale);

      // Check character-bat collisions
      checkCharacterBatCollisions();

      // Check boundary collisions
      const { newPos, newVel: boundaryVel, hitBottom, hitWall } = checkBoundaryCollisions(
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

      // Checked after the miss so a corner hit only plays the miss sound
      if (hitWall) {
        playWallHit();
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

    // Start animation (cancelling any loop already in flight)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    suspendedRef.current = false;
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
    playBatHit,
    playWallHit,
  ]);

  // Restart a loop that was stopped by a pause, from where the ball left off
  const resumeBall = useCallback(() => {
    if (!suspendedRef.current) return;
    animateBall(ballPositionRef.current, ballVelocityRef.current);
  }, [animateBall, ballPositionRef, ballVelocityRef]);

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
    suspendedRef.current = false;

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
    resumeBall,
    calculateLaunchVelocity,
    resetBallAnimation,
    animationFrame: animationFrameRef,
  };
};
