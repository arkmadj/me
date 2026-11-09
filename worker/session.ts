// Signed game-session tokens. The Worker stamps the issue time, so a submission can't claim
// more play time than has really passed since the game started.
// Format: `<issuedAt>.<nonce>.<signature>`, signed with HMAC-SHA256 over `<issuedAt>.<nonce>`.

// Long enough for any real game, short enough that the used-nonce table stays small
export const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
// The token is fetched as the ball first goes into play, so the server's clock starts a
// network round trip after the client's; allow for that
const CLOCK_SLACK_MS = 2_000;

export interface Session {
  issuedAt: number;
  nonce: string;
}

const encoder = new TextEncoder();
const keys = new Map<string, Promise<CryptoKey>>();

const getKey = (secret: string) => {
  let key = keys.get(secret);
  if (!key) {
    key = crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
      "sign",
      "verify",
    ]);
    keys.set(secret, key);
  }
  return key;
};

const toBase64Url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (value: string) => {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const issueSession = async (secret: string, now = Date.now()) => {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `${now}.${nonce}`;
  const signature = await crypto.subtle.sign("HMAC", await getKey(secret), encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
};

// Returns the session, or a reason the token can't back this run
export const verifySession = async (
  secret: string,
  token: unknown,
  durationMs: number,
  now = Date.now(),
): Promise<Session | string> => {
  if (typeof token !== "string") return "Missing game session";
  const parts = token.split(".");
  if (parts.length !== 3) return "Invalid game session";
  const [issued, nonce, signature] = parts;
  if (!/^\d{1,16}$/.test(issued) || !/^[A-Za-z0-9_-]{22}$/.test(nonce)) return "Invalid game session";

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = fromBase64Url(signature);
  } catch {
    return "Invalid game session";
  }
  // verify() compares in constant time
  const valid = await crypto.subtle.verify(
    "HMAC",
    await getKey(secret),
    signatureBytes,
    encoder.encode(`${issued}.${nonce}`),
  );
  if (!valid) return "Invalid game session";

  const issuedAt = Number(issued);
  if (issuedAt > now || now - issuedAt > SESSION_TTL_MS) return "Game session expired";
  if (durationMs > now - issuedAt + CLOCK_SLACK_MS) return "Run is longer than its game session";

  return { issuedAt, nonce };
};
