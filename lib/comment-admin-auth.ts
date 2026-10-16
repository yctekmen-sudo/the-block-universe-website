
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function signSession(expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`comment-admin-session-v2:${expiresAt}`)
    .digest("hex");
}

export function createAdminSession(secret: string) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  const signature = signSession(expiresAt, secret);

  return `${expiresAt}.${signature}`;
}

export function verifyAdminSession(
  session: string | undefined,
  secret: string
): boolean {
  if (!session) return false;

  const match = /^([1-9]\d{0,15})\.([a-f0-9]{64})$/.exec(session);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + SESSION_DURATION_SECONDS
  ) {
    return false;
  }

  const expected = signSession(expiresAt, secret);

  return timingSafeEqual(
    Buffer.from(match[2], "hex"),
    Buffer.from(expected, "hex")
  );
}
