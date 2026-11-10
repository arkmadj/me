import { env, exports } from "cloudflare:workers";
import { evictDurableObject, reset, runInDurableObject } from "cloudflare:test";
import { afterEach, describe, expect, it } from "vitest";
import { LEADERBOARD_SIZE } from "../shared/leaderboard";
import type { LeaderboardEntry, SubmitResult } from "../shared/leaderboard";
import { issueSession, verifySession } from "./session";
import type { Leaderboard } from "./index";

// Every test starts from an empty board and rate-limit table
afterEach(() => reset());

const board = () => env.LEADERBOARD.getByName("global");

// A session issued `ageMs` ago, so runs up to that long verify
const sessionFor = async (ageMs = 60_000) => {
  const token = await issueSession(env.SESSION_SECRET, Date.now() - ageMs);
  const session = await verifySession(env.SESSION_SECRET, token, 0);
  if (typeof session === "string") throw new Error(session);
  return { token, session };
};

const api = (path: string, init?: RequestInit) => exports.default.fetch(`https://example.com${path}`, init);

const postScore = async (body: Record<string, unknown>, ip = "203.0.113.1") =>
  api("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify({ session: (await sessionFor()).token, ...body }),
  });

describe("Leaderboard Durable Object", () => {
  it("starts empty", async () => {
    expect(await board().top()).toEqual([]);
  });

  it("stores a submission and reports its rank", async () => {
    const { session } = await sessionFor();
    const result = await board().submit("a", session, { name: "neo", score: 100, durationMs: 5_000 });
    expect(result).toMatchObject({ rank: 1, entries: [{ name: "neo", score: 100, durationMs: 5_000 }] });
    expect(await board().top()).toHaveLength(1);
  });

  it("orders by score, then shorter duration, then earlier submission", async () => {
    const stub = board();
    const submit = async (client: string, name: string, score: number, durationMs: number) =>
      stub.submit(client, (await sessionFor()).session, { name, score, durationMs });

    await submit("a", "slow", 100, 9_000);
    await submit("b", "low", 50, 2_000);
    await submit("c", "fast", 100, 4_000);
    const result = (await submit("d", "tie", 100, 4_000)) as SubmitResult;

    expect(result.entries.map((e) => e.name)).toEqual(["fast", "tie", "slow", "low"]);
    expect(result.rank).toBe(2);
  });

  it(`keeps only the top ${LEADERBOARD_SIZE} and gives no rank to entries that miss it`, async () => {
    const stub = board();
    for (let i = 1; i <= LEADERBOARD_SIZE; i++) {
      await stub.submit(`c${i}`, (await sessionFor()).session, { name: `p${i}`, score: 100 + i * 5, durationMs: 5_000 });
    }
    const result = (await stub.submit("late", (await sessionFor()).session, {
      name: "late",
      score: 5,
      durationMs: 5_000,
    })) as SubmitResult;

    expect(result.rank).toBeNull();
    expect(result.entries).toHaveLength(LEADERBOARD_SIZE);
    expect(result.entries.some((e) => e.name === "late")).toBe(false);

    const rows = await runInDurableObject(stub, (_instance: Leaderboard, state) =>
      state.storage.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM scores").one(),
    );
    expect(rows.n).toBe(LEADERBOARD_SIZE);
  });

  it("rate-limits a client that submits again within the window", async () => {
    const stub = board();
    await stub.submit("a", (await sessionFor()).session, { name: "neo", score: 10, durationMs: 5_000 });
    const second = await stub.submit("a", (await sessionFor()).session, { name: "neo", score: 20, durationMs: 5_000 });
    expect(second).toEqual({ error: "Too many submissions, try again shortly", status: 429 });

    // Other clients are unaffected
    const other = await stub.submit("b", (await sessionFor()).session, { name: "trin", score: 20, durationMs: 5_000 });
    expect(other).toMatchObject({ rank: 1 });
  });

  it("lets a client submit again once the window has passed", async () => {
    const stub = board();
    await stub.submit("a", (await sessionFor()).session, { name: "neo", score: 10, durationMs: 5_000 });
    // Backdate the last submission rather than waiting out the window
    await runInDurableObject(stub, (_instance: Leaderboard, state) => {
      state.storage.sql.exec("UPDATE submitters SET last_at = last_at - 60000 WHERE client = 'a'");
    });
    const again = await stub.submit("a", (await sessionFor()).session, { name: "neo", score: 20, durationMs: 5_000 });
    expect(again).toMatchObject({ rank: 1 });
  });

  it("rejects a session that was already used", async () => {
    const stub = board();
    const { session } = await sessionFor();
    await stub.submit("a", session, { name: "neo", score: 10, durationMs: 5_000 });
    const replay = await stub.submit("b", session, { name: "neo", score: 20, durationMs: 5_000 });
    expect(replay).toEqual({ error: "This run was already submitted", status: 409 });
    expect(await stub.top()).toHaveLength(1);
  });

  it("keeps its data across restarts", async () => {
    const stub = board();
    await stub.submit("a", (await sessionFor()).session, { name: "neo", score: 10, durationMs: 5_000 });
    // The next instance re-runs the constructor's CREATE TABLE IF NOT EXISTS against existing storage
    await evictDurableObject(stub);
    expect(await board().top()).toHaveLength(1);
  });
});

describe("Worker routes", () => {
  it("uses the test secret rather than a local .dev.vars", () => {
    expect(env.SESSION_SECRET).toBe("test-secret");
  });

  it("issues a verifiable session token", async () => {
    const res = await api("/api/sessions", { method: "POST" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const { token } = await res.json<{ token: string }>();
    expect(typeof (await verifySession(env.SESSION_SECRET, token, 0))).toBe("object");
  });

  it("only issues sessions on POST", async () => {
    expect((await api("/api/sessions")).status).toBe(405);
  });

  it("returns 404 for unknown API paths", async () => {
    expect((await api("/api/nope")).status).toBe(404);
  });

  it("rejects unsupported methods on /api/scores", async () => {
    expect((await api("/api/scores", { method: "DELETE" })).status).toBe(405);
  });

  it("lists scores", async () => {
    await postScore({ name: "neo", score: 100, durationMs: 5_000 });
    const res = await api("/api/scores");
    expect(res.status).toBe(200);
    const { entries } = await res.json<{ entries: LeaderboardEntry[] }>();
    expect(entries).toMatchObject([{ name: "neo", score: 100, durationMs: 5_000 }]);
  });

  it("accepts a valid score and normalizes the name", async () => {
    const res = await postScore({ name: "  neo   the one ", score: 100, durationMs: 5_000.4 });
    expect(res.status).toBe(200);
    const body = await res.json<SubmitResult>();
    expect(body.rank).toBe(1);
    expect(body.entries[0]).toMatchObject({ name: "neo the one", durationMs: 5_000 });
  });

  it("rejects invalid JSON", async () => {
    const res = await api("/api/scores", { method: "POST", body: "{" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON" });
  });

  it("rejects an invalid submission", async () => {
    const res = await postScore({ name: "neo", score: 7, durationMs: 5_000 });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid score" });
  });

  it("rejects a submission without a valid session", async () => {
    const missing = await postScore({ session: undefined, name: "neo", score: 10, durationMs: 5_000 });
    expect(missing.status).toBe(403);
    expect(await missing.json()).toEqual({ error: "Missing game session" });

    const forged = await issueSession("wrong-secret");
    const bad = await postScore({ session: forged, name: "neo", score: 10, durationMs: 1_000 });
    expect(bad.status).toBe(403);
    expect(await bad.json()).toEqual({ error: "Invalid game session" });
  });

  it("rejects a run longer than its session", async () => {
    const { token } = await sessionFor(1_000);
    const res = await postScore({ session: token, name: "neo", score: 10, durationMs: 60_000 });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Run is longer than its game session" });
  });

  it("rate-limits by client IP", async () => {
    expect((await postScore({ name: "neo", score: 10, durationMs: 5_000 }, "198.51.100.7")).status).toBe(200);
    const res = await postScore({ name: "neo", score: 20, durationMs: 5_000 }, "198.51.100.7");
    expect(res.status).toBe(429);
    expect((await postScore({ name: "trin", score: 20, durationMs: 5_000 }, "198.51.100.8")).status).toBe(200);
  });
});
