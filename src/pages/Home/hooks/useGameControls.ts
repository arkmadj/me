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

const isTextField = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.closest("input, textarea, select") !== null);

// Space on a focused link or button activates it (e.g. the skip link, the mute
// button), so it must not also launch or pause the game
const isInteractiveTarget = (target: EventTarget | null) =>
  isTextField(target) ||
  (target instanceof HTMLElement &&
    target.closest("a[href], button, [role='button'], [role='link']") !== null);

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
      // Typing in a field (e.g. the leaderboard name) needs Space and the arrows
      if (e.key !== "Escape" && isTextField(e.target)) {
        return;
      }
      if (e.key === " " && isInteractiveTarget(e.target)) {
        return;
      }

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

      // Escape toggles the pause menu (it never launches a new ball)
      if (e.key === "Escape") {
        if (gameStateRef.current === "running") {
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
