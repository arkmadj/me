import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GameContext } from "./GameContext";
import type { GameState, GameTimer } from "./GameContext";
import { startSession } from "@/lib/leaderboard";

interface GameProviderProps {
  children: ReactNode;
}

const INITIAL_LIVES = 3;
const INITIAL_SCORE = 0;
const INITIAL_TIMER: GameTimer = { bankedMs: 0, startedAt: null };
const BEST_SCORE_KEY = "maytricks:best-score";
const MUTED_KEY = "maytricks:muted";

const isGameEnded = (state: GameState) => state === "over" || state === "won";

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

const readMuted = () => {
  try {
    return localStorage.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
};

const saveMuted = (value: boolean) => {
  try {
    localStorage.setItem(MUTED_KEY, String(value));
  } catch {
    // ignore
  }
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setRawGameState] = useState<GameState>('new');
  const [timer, setTimer] = useState<GameTimer>(INITIAL_TIMER);
  const [mutedSound, setMutedSound] = useState(readMuted);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [lives, setLives] = useState(INITIAL_LIVES);
  // Best score from previous games; the current game is folded in on reset
  const [bestScore, setBestScore] = useState(readBestScore);
  const isNewBest = score > bestScore;
  // Synchronous copies for the game loop, which can report several events before React commits.
  // Its callbacks are also bound once on the first render, so they can't read state directly.
  const gameStateRef = useRef<GameState>("new");
  const livesRef = useRef(INITIAL_LIVES);
  // Requested as the ball first goes into play, so the server's clock starts with the game
  const sessionRef = useRef<Promise<string | null> | null>(null);

  // Persist as soon as a game ends so a reload keeps the new best
  useEffect(() => {
    if ((gameState === "over" || gameState === "won") && isNewBest) {
      saveBestScore(score);
    }
  }, [gameState, isNewBest, score]);

  useEffect(() => {
    saveMuted(mutedSound);
  }, [mutedSound]);

  // Only time spent with the ball in play counts, so pauses and serves don't run the clock.
  // Stable identity: Home relies on it inside effects and callbacks.
  const setGameState = useCallback((next: GameState) => {
    // A finished game only leaves through a reset, so a late event can't undo the result
    if (isGameEnded(gameStateRef.current) && next !== "new") return;
    gameStateRef.current = next;
    if (next === "running" && !sessionRef.current) {
      sessionRef.current = startSession().catch(() => null);
    }

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

  const loseLife = useCallback(() => {
    if (isGameEnded(gameStateRef.current)) return;

    const remaining = Math.max(0, livesRef.current - 1);
    livesRef.current = remaining;
    setLives(remaining);
    setGameState(remaining === 0 ? "over" : "restart");
  }, [setGameState]);

  const resetGame = () => {
    if (isNewBest) {
      setBestScore(score);
      saveBestScore(score);
    }
    setGameState('new');
    setScore(INITIAL_SCORE);
    livesRef.current = INITIAL_LIVES;
    setLives(INITIAL_LIVES);
    setTimer(INITIAL_TIMER);
    sessionRef.current = null;
  };

  const toggleSound = () => {
    setMutedSound((prev) => !prev)
  }

  const getSessionToken = () => sessionRef.current ?? Promise.resolve(null);

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
    loseLife,
    resetGame,
    toggleSound,
    getSessionToken,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
