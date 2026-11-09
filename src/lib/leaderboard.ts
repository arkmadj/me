import { LEADERBOARD_SIZE, normalizeName } from "@shared/leaderboard";
import type { LeaderboardEntry, ScoreSubmission, SubmitResult } from "@shared/leaderboard";

export type { LeaderboardEntry } from "@shared/leaderboard";

const ENDPOINT = "/api/scores";
const SESSION_ENDPOINT = "/api/sessions";
const NAME_KEY = "maytricks:player-name";

const request = async <T>(init?: RequestInit, endpoint = ENDPOINT): Promise<T> => {
  const res = await fetch(endpoint, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? "Leaderboard unavailable");
  return body as T;
};

export const fetchLeaderboard = async () =>
  (await request<{ entries: LeaderboardEntry[] }>()).entries;

// The server stamps when the game started, so a submission can't claim more play time than that
export const startSession = async () =>
  (await request<{ token: string }>({ method: "POST" }, SESSION_ENDPOINT)).token;

export const submitScore = (submission: ScoreSubmission, session: string) =>
  request<SubmitResult>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...submission, session }),
  });

// Mirrors the server's ordering: higher score first, then the faster run
export const qualifies = (entries: LeaderboardEntry[], score: number, durationMs: number) => {
  if (score <= 0) return false;
  if (entries.length < LEADERBOARD_SIZE) return true;
  const last = entries[entries.length - 1];
  return score > last.score || (score === last.score && durationMs < last.durationMs);
};

// Storage can be unavailable (private mode, blocked site data), so fail quietly
export const readPlayerName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
};

export const savePlayerName = (name: string) => {
  try {
    localStorage.setItem(NAME_KEY, normalizeName(name));
  } catch {
    // ignore
  }
};
