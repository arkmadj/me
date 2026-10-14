import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { GameState } from "./GameContext";

interface GameProviderProps {
  children: ReactNode;
}

const INITIAL_LIVES = 3;
const INITIAL_SCORE = 0;
const BEST_SCORE_KEY = "maytricks:best-score";

// Storage can be unavailable (private mode, blocked site data), so fail quietly
const readBestScore = () => {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
};

const saveBestScore = (value: number) => {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(value));
  } catch {
    // ignore
  }
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>('new');
  const [mutedSound, setMutedSound] = useState<boolean>(false);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [lives, setLives] = useState(INITIAL_LIVES);
  // Best score from previous games; the current game is folded in on reset
  const [bestScore, setBestScore] = useState(readBestScore);
  const isNewBest = score > bestScore;

  // Persist as soon as a game ends so a reload keeps the new best
  useEffect(() => {
    if ((gameState === "over" || gameState === "won") && isNewBest) {
      saveBestScore(score);
    }
  }, [gameState, isNewBest, score]);

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
    if (isNewBest) {
      setBestScore(score);
      saveBestScore(score);
    }
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
    bestScore: Math.max(bestScore, score),
    isNewBest,
    mutedSound,
    setGameState,
    incrementScore,
    decrementLives,
    resetGame,
    toggleSound
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
