import { useState } from "react";
import type { ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { GameState } from "./GameContext";

interface GameProviderProps {
  children: ReactNode;
}

const INITIAL_LIVES = 3;
const INITIAL_SCORE = 0;

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>('new');
  const [mutedSound, setMutedSound] = useState<boolean>(false);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [lives, setLives] = useState(INITIAL_LIVES);

  const incrementScore = (points: number) => {
    setScore((prev) => prev + points);
  };

  const decrementLives = () => {
    setLives((prev) => {
      const newLives = Math.max(0, prev - 1);
      if (newLives === 0) {
        setGameState('over');
      }
      return newLives;
    });
  };

  const resetGame = () => {
    setGameState('new');
    setScore(INITIAL_SCORE);
    setLives(INITIAL_LIVES);
  };

  const toggleSound = () => {
    setMutedSound((prev) => !prev)
  }

  const value = {
    gameState,
    score,
    lives,
    mutedSound,
    setGameState,
    incrementScore,
    decrementLives,
    resetGame,
    toggleSound
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
