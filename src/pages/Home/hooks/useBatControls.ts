import { useRef, useCallback, useEffect } from "react";
import { getResponsiveValues } from "../constants";
import type { GameState } from "@/context";

interface UseBatControlsProps {
  batRef: React.RefObject<HTMLDivElement | null>;
  batPositionRef: React.RefObject<number>;
  gameStateRef: React.RefObject<GameState>;
}

export const useBatControls = ({
  batRef,
  batPositionRef,
  gameStateRef,
}: UseBatControlsProps) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const batAnimationFrame = useRef<number | null>(null);
  const isTouching = useRef(false);
  const touchStartX = useRef(0);
  const updateBatPositionRef = useRef<(() => void) | null>(null);

  const updateBatPosition = useCallback(() => {
    if (!batRef.current) return;

    // Don't update bat if game is not running
    if (gameStateRef.current !== "running") {
      if (keysPressed.current.size > 0) {
        batAnimationFrame.current = requestAnimationFrame(() => updateBatPositionRef.current?.());
      } else {
        batAnimationFrame.current = null;
      }
      return;
    }

    const { moveSpeed, batWidth, screenWidth } = getResponsiveValues();
    const maxPosition = screenWidth / 2 - batWidth / 2;
    const minPosition = -screenWidth / 2 + batWidth / 2;

    let moved = false;

    // Update position based on keys pressed
    if (keysPressed.current.has("ArrowLeft")) {
      batPositionRef.current = Math.max(
        minPosition,
        batPositionRef.current - moveSpeed,
      );
      moved = true;
    }
    if (keysPressed.current.has("ArrowRight")) {
      batPositionRef.current = Math.min(
        maxPosition,
        batPositionRef.current + moveSpeed,
      );
      moved = true;
    }

    // Apply transform
    if (moved) {
      batRef.current.style.transform = `translateX(${batPositionRef.current}px)`;
    }

    // Continue animation loop
    if (keysPressed.current.size > 0) {
      batAnimationFrame.current = requestAnimationFrame(() => updateBatPositionRef.current?.());
    } else {
      batAnimationFrame.current = null;
    }
  }, [batRef, batPositionRef, gameStateRef]);

  // Keep the ref up to date
  useEffect(() => {
    updateBatPositionRef.current = updateBatPosition;
  }, [updateBatPosition]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const wasEmpty = keysPressed.current.size === 0;
        keysPressed.current.add(e.key);

        if (wasEmpty && !batAnimationFrame.current) {
          batAnimationFrame.current = requestAnimationFrame(() => updateBatPositionRef.current?.());
        }
      }
    },
    [],
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      keysPressed.current.delete(e.key);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!batRef.current || !isTouching.current) return;
      if (gameStateRef.current !== "running") return;

      e.preventDefault();

      const touch = e.touches[0];
      const touchX = touch.clientX;
      const { batWidth, screenWidth } = getResponsiveValues();
      const centerX = screenWidth / 2;
      const relativeX = touchX - centerX;

      const maxPosition = screenWidth / 2 - batWidth / 2;
      const minPosition = -screenWidth / 2 + batWidth / 2;

      batPositionRef.current = Math.max(
        minPosition,
        Math.min(maxPosition, relativeX),
      );
      batRef.current.style.transform = `translateX(${batPositionRef.current}px)`;
    },
    [batRef, batPositionRef, gameStateRef],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!batRef.current) return;
      const touch = e.touches[0];
      isTouching.current = true;
      touchStartX.current = touch.clientX;
    },
    [batRef],
  );

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
  }, []);

  const resetBatControls = useCallback(() => {
    // Clear all pressed keys
    keysPressed.current.clear();

    // Cancel any ongoing animation frames
    if (batAnimationFrame.current) {
      cancelAnimationFrame(batAnimationFrame.current);
      batAnimationFrame.current = null;
    }

    // Reset bat position to center
    batPositionRef.current = 0;

    // Reset touch state
    isTouching.current = false;
    touchStartX.current = 0;

    // Update visual position
    if (batRef.current) {
      batRef.current.style.transform = `translateX(0px) scale(0)`;
    }
  }, [batRef, batPositionRef]);

  const showBat = useCallback(() => {
    if (batRef.current) {
      batRef.current.style.transform = `translateX(${batPositionRef.current}px) scale(1)`;
    }
  }, [batRef, batPositionRef]);

  return {
    handleKeyDown,
    handleKeyUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetBatControls,
    showBat,
    batAnimationFrame,
  };
};
