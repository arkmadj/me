import { createContext, useContext } from "react";

export type GameState = 'paused' | 'running' | 'over' | 'new'; 

export interface GameContextType {
  gameState: GameState;
  score: number;
  lives: number;
  setGameState: (state: GameState) => void;
  incrementScore: (points: number) => void;
  decrementLives: () => void;
  resetGame: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};