import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { GameState, GameTimer } from "./GameContext";

interface GameProviderProps {
  children: ReactNode;
}

const INITIAL_LIVES = 3;
const INITIAL_SCORE = 0;
const INITIAL_TIMER: GameTimer = { bankedMs: 0, startedAt: null };
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
  const [gameState, setRawGameState] = useState<GameState>('new');
  const [timer, setTimer] = useState<GameTimer>(INITIAL_TIMER);
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

  // Only time spent with the ball in play counts, so pauses and serves don't run the clock.
  // Stable identity: Home relies on it inside effects and callbacks.
  const setGameState = useCallback((next: GameState) => {
    const now = Date.now();
    setTimer((prev) => {
      if (next === "running") {
        return prev.startedAt === null ? { ...prev, startedAt: now } : prev;
      }
      return prev.startedAt === null
        ? prev
        : { bankedMs: prev.bankedMs + now - prev.startedAt, startedAt: null };
    });
    setRawGameState(next);
  }, []);

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
    setTimer(INITIAL_TIMER);
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
    timer,
    mutedSound,
    setGameState,
    incrementScore,
    decrementLives,
    resetGame,
    toggleSound
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
