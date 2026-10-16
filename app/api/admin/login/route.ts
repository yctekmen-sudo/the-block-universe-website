
import { createHmac, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.COMMENT_ADMIN_SECRET;
  const hashSecret = process.env.COMMENT_IP_HASH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  if (!secret || !hashSecret || !databaseUrl) {
    return NextResponse.json(
      { error: "Administrator login unavailable" },
      { status: 503 }
    );
  }

  // Reject requests from other websites.
  const expectedOrigin = new URL(request.url).origin;
  const suppliedOrigin = request.headers.get("origin");

  if (suppliedOrigin !== expectedOrigin) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  // Identify the visitor for rate limiting.
  const ipAddress = request.headers.get("x-real-ip")?.trim();

  if (!ipAddress) {
    return NextResponse.json(
      { error: "Unable to verify request" },
      { status: 403 }
    );
  }

  const ipHash = createHmac("sha256", hashSecret)
    .update(ipAddress)
    .digest("hex");

  const sql = neon(databaseUrl);

  // Atomically count login attempts in one-hour windows.
  const rateLimit = await sql`
    INSERT INTO admin_login_rate_limits (
      ip_hash,
      window_start,
      attempt_count
    )
    VALUES (
      ${ipHash},
      date_trunc('hour', NOW()),
      1
    )
    ON CONFLICT (ip_hash, window_start)
    DO UPDATE SET
      attempt_count =
        admin_login_rate_limits.attempt_count + 1
    RETURNING attempt_count
  `;

  if (Number(rateLimit[0].attempt_count) > 5) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const suppliedSecret =
    body && typeof body === "object" && "secret" in body
      ? (body as { secret: unknown }).secret
      : null;

  if (typeof suppliedSecret !== "string") {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Compare credentials without leaking timing information.
  const expected = createHmac("sha256", secret)
    .update("administrator-login")
    .digest();

  const received = createHmac("sha256", suppliedSecret)
    .update("administrator-login")
    .digest();

  if (!timingSafeEqual(expected, received)) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Establish an administrator session.
  const session = createHmac("sha256", secret)
    .update("administrator-session-v1")
    .digest("hex");

  const response = NextResponse.json({ success: true });

  response.cookies.set("comment_admin_session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/admin",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
