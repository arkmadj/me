import { createContext, useContext } from "react";

export type GameState =
  | "paused"
  | "running"
  | "over"
  | "new"
  | "restart"
  | "won";

// Play time is banked whenever the game leaves "running"; startedAt marks the current run
export interface GameTimer {
  bankedMs: number;
  startedAt: number | null;
}

export interface GameContextType {
  gameState: GameState;
  score: number;
  lives: number;
  bestScore: number;
  isNewBest: boolean;
  timer: GameTimer;
  mutedSound: boolean;
  setGameState: (state: GameState) => void;
  incrementScore: (points: number) => void;
  // Takes a life and moves to "restart", or to "over" on the last one
  loseLife: () => void;
  resetGame: () => void;
  toggleSound: () => void;
  // The leaderboard token for the current game; null if it couldn't be fetched
  getSessionToken: () => Promise<string | null>;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
