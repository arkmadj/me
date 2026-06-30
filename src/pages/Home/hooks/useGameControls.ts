import { useCallback } from "react";
import type { GameState } from "@/context";

interface UseGameControlsProps {
  gameStateRef: React.RefObject<GameState>;
  setGameState: (state: GameState) => void;
  welcomeAnimationComplete: React.RefObject<boolean>;
  launchBall: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}

export const useGameControls = ({
  gameStateRef,
  setGameState,
  welcomeAnimationComplete,
  launchBall,
  onKeyDown,
  onKeyUp,
}: UseGameControlsProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Pass through to bat controls first
      if (onKeyDown) {
        onKeyDown(e);
      }

      // Handle space bar for game state
      if (e.key === " ") {
        e.preventDefault();

        if (!welcomeAnimationComplete.current) {
          return;
        }

        if (gameStateRef.current === "new" || gameStateRef.current === "restart") {
          launchBall();
        } else if (gameStateRef.current === "running") {
          setGameState("paused");
        } else if (gameStateRef.current === "paused") {
          setGameState("running");
        }
      }
    },
    [setGameState, welcomeAnimationComplete, launchBall, onKeyDown, gameStateRef]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (onKeyUp) {
        onKeyUp(e);
      }
    },
    [onKeyUp]
  );

  return {
    handleKeyDown,
    handleKeyUp,
  };
};
