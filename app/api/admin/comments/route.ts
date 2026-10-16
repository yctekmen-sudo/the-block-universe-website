
import { createHmac, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.COMMENT_ADMIN_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  if (!secret || !databaseUrl) {
    return NextResponse.json(
      { error: "Administrator service unavailable" },
      { status: 503 }
    );
  }

  const session = request.cookies.get("comment_admin_session")?.value;

  const expectedSession = createHmac("sha256", secret)
    .update("administrator-session-v1")
    .digest("hex");

  if (
    !session ||
    !/^[a-f0-9]{64}$/.test(session) ||
    !timingSafeEqual(
      Buffer.from(session, "hex"),
      Buffer.from(expectedSession, "hex")
    )
  ) {
    return NextResponse.json(
      { error: "Administrator authentication required" },
      { status: 401 }
    );
  }

  const sql = neon(databaseUrl);

  const comments = await sql`
    SELECT
      id,
      chapter_id,
      author_name,
      comment_text,
      created_at
    FROM comments
    ORDER BY created_at DESC, id DESC
    LIMIT 200
  `;

  return NextResponse.json(
    { comments },
    { headers: { "Cache-Control": "no-store" } }
  );
}
