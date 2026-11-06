// Shared by the game client and the Worker so both validate the same way

export interface LeaderboardEntry {
  name: string;
  score: number;
  durationMs: number;
  createdAt: number;
}

export interface ScoreSubmission {
  name: string;
  score: number;
  durationMs: number;
}

export interface SubmitResult {
  rank: number | null;
  entries: LeaderboardEntry[];
}

export const LEADERBOARD_SIZE = 10;
export const NAME_MAX_LENGTH = 12;

// 21 letters in "WELCOME TO THE MAYTRICKS", each worth 10 when hit and 5 when caught
export const MAX_SCORE = 21 * 15;
export const SCORE_STEP = 5;
// Nobody clears a letter in under half a second of ball time
export const MIN_MS_PER_POINT = 500 / 15;

const NAME_PATTERN = /^[A-Za-z0-9 _.-]+$/;

export const normalizeName = (raw: string) => raw.trim().replace(/\s+/g, " ").slice(0, NAME_MAX_LENGTH);

export const validateSubmission = (input: unknown): ScoreSubmission | string => {
  if (typeof input !== "object" || input === null) return "Invalid body";
  const { name, score, durationMs } = input as Record<string, unknown>;

  if (typeof name !== "string") return "Name is required";
  const cleanName = normalizeName(name);
  if (!cleanName) return "Name is required";
  if (!NAME_PATTERN.test(cleanName)) return "Name may only use letters, numbers, spaces, _ . -";

  if (typeof score !== "number" || !Number.isInteger(score)) return "Invalid score";
  if (score <= 0 || score > MAX_SCORE || score % SCORE_STEP !== 0) return "Invalid score";

  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0) return "Invalid duration";
  if (durationMs < score * MIN_MS_PER_POINT) return "Invalid duration";

  return { name: cleanName, score, durationMs: Math.round(durationMs) };
};
