
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get("chapter");

  if (!chapterId || !/^section-\d+$/.test(chapterId)) {
    return NextResponse.json(
      { error: "Invalid chapter" },
      { status: 400 }
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not configured");
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }

  try {
    const sql = neon(databaseUrl);

    const comments = await sql`
      SELECT
        id,
        chapter_id,
        author_name,
        comment_text,
        parent_id,
        created_at
      FROM comments
      WHERE chapter_id = ${chapterId}
        AND approved = TRUE
      ORDER BY created_at ASC, id ASC
      LIMIT 200
    `;

    return NextResponse.json(
      { comments },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to retrieve comments:", error);

    return NextResponse.json(
      { error: "Unable to retrieve comments" },
      { status: 500 }
    );
  }
}
