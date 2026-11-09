import { DurableObject } from "cloudflare:workers";
import { LEADERBOARD_SIZE, validateSubmission } from "../shared/leaderboard";
import type { LeaderboardEntry, ScoreSubmission, SubmitResult } from "../shared/leaderboard";
import { SESSION_TTL_MS, issueSession, verifySession } from "./session";
import type { Session } from "./session";

// One submission per client per window keeps casual spamming off the board
const RATE_LIMIT_MS = 10_000;

type EntryRow = { name: string; score: number; duration_ms: number; created_at: number };

const toEntry = (row: EntryRow): LeaderboardEntry => ({
  name: row.name,
  score: row.score,
  durationMs: row.duration_ms,
  createdAt: row.created_at,
});

// A portfolio leaderboard sees little traffic, so a single instance holds the whole board
export class Leaderboard extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          score INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS scores_rank ON scores (score DESC, duration_ms ASC, created_at ASC);
        CREATE TABLE IF NOT EXISTS submitters (
          client TEXT PRIMARY KEY,
          last_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS used_sessions (
          nonce TEXT PRIMARY KEY,
          issued_at INTEGER NOT NULL
        );
      `);
    });
  }

  top(): LeaderboardEntry[] {
    return this.ctx.storage.sql
      .exec<EntryRow>(
        "SELECT name, score, duration_ms, created_at FROM scores ORDER BY score DESC, duration_ms ASC, created_at ASC LIMIT ?",
        LEADERBOARD_SIZE,
      )
      .toArray()
      .map(toEntry);
  }

  submit(client: string, session: Session, entry: ScoreSubmission): SubmitResult | { error: string; status: number } {
    const now = Date.now();
    const sql = this.ctx.storage.sql;
    const last = sql
      .exec<{ last_at: number }>("SELECT last_at FROM submitters WHERE client = ?", client)
      .toArray()[0];
    if (last && now - last.last_at < RATE_LIMIT_MS) {
      return { error: "Too many submissions, try again shortly", status: 429 };
    }

    // Each game session backs one submission, so a token can't be replayed for more entries
    const used = sql.exec("SELECT 1 FROM used_sessions WHERE nonce = ?", session.nonce).toArray().length > 0;
    if (used) return { error: "This run was already submitted", status: 409 };
    sql.exec("INSERT INTO used_sessions (nonce, issued_at) VALUES (?, ?)", session.nonce, session.issuedAt);
    // Expired tokens fail verification anyway, so their nonces no longer need tracking
    sql.exec("DELETE FROM used_sessions WHERE issued_at < ?", now - SESSION_TTL_MS);

    sql.exec(
      "INSERT INTO submitters (client, last_at) VALUES (?, ?) ON CONFLICT (client) DO UPDATE SET last_at = excluded.last_at",
      client,
      now,
    );
    sql.exec("DELETE FROM submitters WHERE last_at < ?", now - RATE_LIMIT_MS);

    const { id } = sql
      .exec<{ id: number }>(
        "INSERT INTO scores (name, score, duration_ms, created_at) VALUES (?, ?, ?, ?) RETURNING id",
        entry.name,
        entry.score,
        entry.durationMs,
        now,
      )
      .one();

    // Only the board is ever shown, so drop everything that fell off it
    sql.exec(
      `DELETE FROM scores WHERE id NOT IN (
        SELECT id FROM scores ORDER BY score DESC, duration_ms ASC, created_at ASC LIMIT ?
      )`,
      LEADERBOARD_SIZE,
    );

    // One bounded read yields both the new entry's rank and the board to return
    const ranked = sql
      .exec<EntryRow & { id: number }>(
        "SELECT id, name, score, duration_ms, created_at FROM scores ORDER BY score DESC, duration_ms ASC, created_at ASC LIMIT ?",
        LEADERBOARD_SIZE,
      )
      .toArray();
    const index = ranked.findIndex((row) => row.id === id);
    return { rank: index === -1 ? null : index + 1, entries: ranked.map(toEntry) };
  }
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Only /api/* reaches the Worker (see run_worker_first); assets handle everything else
    // Without a secret no run could be verified, so fail loudly rather than accept unsigned scores
    if (!env.SESSION_SECRET) return json({ error: "Leaderboard not configured" }, 503);

    if (url.pathname === "/api/sessions") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      return json({ token: await issueSession(env.SESSION_SECRET) });
    }
    if (url.pathname !== "/api/scores") return json({ error: "Not found" }, 404);

    const board = env.LEADERBOARD.getByName("global");

    if (request.method === "GET") {
      return json({ entries: await board.top() });
    }

    if (request.method === "POST") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      const result = validateSubmission(body);
      if (typeof result === "string") return json({ error: result }, 400);

      const session = await verifySession(env.SESSION_SECRET, (body as { session?: unknown }).session, result.durationMs);
      if (typeof session === "string") return json({ error: session }, 403);

      const client = request.headers.get("CF-Connecting-IP") ?? "local";
      const outcome = await board.submit(client, session, result);
      return "error" in outcome ? json({ error: outcome.error }, outcome.status) : json(outcome);
    }

    return json({ error: "Method not allowed" }, 405);
  },
} satisfies ExportedHandler<Env>;
