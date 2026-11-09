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

// Deliberately small: catches the obvious stuff without a dependency.
// Matched anywhere in the name, so only words that rarely appear inside innocent ones
const BLOCKED_SUBSTRINGS = [
  "fuck", "shit", "cunt", "nigger", "nigga", "faggot", "bitch", "whore", "slut", "rapist",
  "retard", "pussy", "penis", "vagina", "porn", "nazi", "hitler", "twat", "dildo", "jizz",
  "wanker", "bastard", "molest",
];
// Matched only as a whole word (or the whole name) because they hide inside real words: grape, spicy, dickens
const BLOCKED_WORDS = new Set([
  "ass", "arse", "fag", "rape", "dick", "cock", "cum", "tits", "spic", "kike", "chink", "coon",
  "kkk", "wank", "anal", "sex", "pedo",
]);
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t" };

const collapseRepeats = (s: string) => s.replace(/(.)\1+/g, "$1");

export const isBlockedName = (name: string) => {
  const base = name.toLowerCase().replace(/[013457]/g, (c) => LEET[c]);
  const words = base.split(/[ _.-]+/).filter(Boolean);
  const joined = words.join("");
  // Check both as typed and with stretched letters squashed, so "fuuuck" still matches
  const forms = [joined, collapseRepeats(joined)];
  if (BLOCKED_SUBSTRINGS.some((w) => forms.some((f) => f.includes(w)))) return true;
  return [...words, ...words.map(collapseRepeats), ...forms].some((w) => BLOCKED_WORDS.has(w));
};

export const validateSubmission = (input: unknown): ScoreSubmission | string => {
  if (typeof input !== "object" || input === null) return "Invalid body";
  const { name, score, durationMs } = input as Record<string, unknown>;

  if (typeof name !== "string") return "Name is required";
  const cleanName = normalizeName(name);
  if (!cleanName) return "Name is required";
  if (!NAME_PATTERN.test(cleanName)) return "Name may only use letters, numbers, spaces, _ . -";
  if (isBlockedName(cleanName)) return "Please pick a different name";

  if (typeof score !== "number" || !Number.isInteger(score)) return "Invalid score";
  if (score <= 0 || score > MAX_SCORE || score % SCORE_STEP !== 0) return "Invalid score";

  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0) return "Invalid duration";
  if (durationMs < score * MIN_MS_PER_POINT) return "Invalid duration";

  return { name: cleanName, score, durationMs: Math.round(durationMs) };
};
