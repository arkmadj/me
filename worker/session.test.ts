import { describe, expect, it } from "vitest";
import { SESSION_TTL_MS, issueSession, verifySession } from "./session";

const SECRET = "test-secret";
const NOW = 1_700_000_000_000;

describe("issueSession", () => {
  it("produces an <issuedAt>.<nonce>.<signature> token", async () => {
    const token = await issueSession(SECRET, NOW);
    const [issued, nonce, signature] = token.split(".");
    expect(issued).toBe(String(NOW));
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(signature).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("uses a fresh nonce each time", async () => {
    const a = await issueSession(SECRET, NOW);
    const b = await issueSession(SECRET, NOW);
    expect(a.split(".")[1]).not.toBe(b.split(".")[1]);
  });
});

describe("verifySession", () => {
  it("accepts a token it issued", async () => {
    const token = await issueSession(SECRET, NOW);
    const result = await verifySession(SECRET, token, 10_000, NOW + 10_000);
    expect(result).toEqual({ issuedAt: NOW, nonce: token.split(".")[1] });
  });

  it("rejects a missing token", async () => {
    expect(await verifySession(SECRET, undefined, 0, NOW)).toBe("Missing game session");
    expect(await verifySession(SECRET, 123, 0, NOW)).toBe("Missing game session");
  });

  it.each(["", "a.b", "a.b.c.d", "abc.AAAAAAAAAAAAAAAAAAAAAA.sig", `${NOW}.short.sig`, `${NOW}.AAAAAAAAAAAAAAAAAAAAAA.***`])(
    "rejects malformed token %j",
    async (token) => {
      expect(await verifySession(SECRET, token, 0, NOW)).toBe("Invalid game session");
    },
  );

  it("rejects a token signed with another secret", async () => {
    const token = await issueSession("other-secret", NOW);
    expect(await verifySession(SECRET, token, 0, NOW)).toBe("Invalid game session");
  });

  it("rejects a token whose issue time was tampered with", async () => {
    const [, nonce, signature] = (await issueSession(SECRET, NOW)).split(".");
    const forged = `${NOW - 60_000}.${nonce}.${signature}`;
    expect(await verifySession(SECRET, forged, 0, NOW)).toBe("Invalid game session");
  });

  it("rejects a token issued in the future", async () => {
    const token = await issueSession(SECRET, NOW + 1);
    expect(await verifySession(SECRET, token, 0, NOW)).toBe("Game session expired");
  });

  it("rejects an expired token", async () => {
    const token = await issueSession(SECRET, NOW);
    expect(await verifySession(SECRET, token, 0, NOW + SESSION_TTL_MS)).toEqual(expect.objectContaining({ issuedAt: NOW }));
    expect(await verifySession(SECRET, token, 0, NOW + SESSION_TTL_MS + 1)).toBe("Game session expired");
  });

  it("rejects runs longer than the session, with a little clock slack", async () => {
    const token = await issueSession(SECRET, NOW);
    const elapsed = 30_000;
    expect(await verifySession(SECRET, token, elapsed + 2_000, NOW + elapsed)).toEqual(
      expect.objectContaining({ issuedAt: NOW }),
    );
    expect(await verifySession(SECRET, token, elapsed + 2_001, NOW + elapsed)).toBe(
      "Run is longer than its game session",
    );
  });
});
