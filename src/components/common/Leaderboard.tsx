import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { NAME_MAX_LENGTH, normalizeName } from "@shared/leaderboard";
import {
  fetchLeaderboard,
  qualifies,
  readPlayerName,
  savePlayerName,
  submitScore,
} from "@/lib/leaderboard";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";
import { KEYCAP } from "@/components/ui/pill";

const LABEL = "text-[10px] uppercase tracking-[0.3em] text-green-500/60";

type Status =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

interface LeaderboardProps {
  score: number;
  durationMs: number;
}

// Global top scores, with a name entry when the finished run makes the board
export const Leaderboard = ({ score, durationMs }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [name, setName] = useState(readPlayerName);
  const [rank, setRank] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // The form needs the current board to know whether this run makes it
  const [boardLoaded, setBoardLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard()
      .then((list) => {
        if (cancelled) return;
        setEntries(list);
        setBoardLoaded(true);
        setStatus({ kind: "ready" });
      })
      .catch((error: Error) => !cancelled && setStatus({ kind: "error", message: error.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = boardLoaded && !submitted && qualifies(entries, score, durationMs);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = normalizeName(name);
    if (!clean) return;
    savePlayerName(clean);
    setStatus({ kind: "submitting" });
    try {
      const result = await submitScore({ name: clean, score, durationMs });
      setEntries(result.entries);
      setRank(result.rank);
      setSubmitted(true);
      setStatus({ kind: "ready" });
    } catch (error) {
      setStatus({ kind: "error", message: (error as Error).message });
    }
  };

  return (
    <section aria-labelledby='leaderboard-title' className='flex w-full flex-col gap-2'>
      <h2 id='leaderboard-title' className={cn(LABEL, "flex items-center justify-between")}>
        Global top 10
        {submitted && rank !== null && <span className='text-green-300'>you placed #{rank}</span>}
      </h2>

      {canSubmit && (
        <form onSubmit={handleSubmit} className='flex gap-1 rounded-full border border-green-400/30 bg-black/60 p-1 text-xs'>
          <input
            aria-label='Your name for the leaderboard'
            placeholder='Enter your name'
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            disabled={status.kind === "submitting"}
            className='min-w-0 flex-1 bg-transparent px-3 uppercase tracking-widest text-green-300 placeholder:text-green-500/40 focus:outline-none'
          />
          <button
            type='submit'
            disabled={status.kind === "submitting" || !normalizeName(name)}
            className={cn(
              KEYCAP,
              "px-3 py-1.5 uppercase tracking-widest transition-opacity disabled:opacity-40",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400/60",
            )}
          >
            {status.kind === "submitting" ? "Saving…" : "Submit"}
          </button>
        </form>
      )}

      {status.kind === "error" && <p className='text-xs text-red-400/90'>{status.message}</p>}

      <div className='max-h-44 overflow-y-auto rounded-xl border border-green-400/20 bg-green-400/5 text-xs'>
        {status.kind === "loading" ? (
          <p className='px-3 py-3 text-center text-green-500/60 animate-pulse'>Loading…</p>
        ) : entries.length === 0 ? (
          <p className='px-3 py-3 text-center text-green-500/60'>
            {status.kind === "error" ? "Leaderboard offline" : "No scores yet. Be the first."}
          </p>
        ) : (
          <ol>
            {entries.map((entry, i) => (
              <li
                key={`${entry.createdAt}-${i}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 tabular-nums text-green-400/90",
                  i > 0 && "border-t border-green-400/10",
                  submitted && rank === i + 1 && "bg-green-400/15 text-green-300",
                )}
              >
                <span className='w-5 text-green-500/60'>{i + 1}</span>
                <span className='min-w-0 flex-1 truncate uppercase tracking-wider'>{entry.name}</span>
                <span className='text-green-300'>{String(entry.score).padStart(4, "0")}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};
