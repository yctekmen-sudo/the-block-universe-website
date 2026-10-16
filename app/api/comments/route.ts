import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const validChapters = new Set([
  "introduction",
  "section-1",
  "section-2",
  "section-3",
  "section-4",
  "section-5",
  "section-6",
  "appendix-a",
]);

function isValidChapter(value: unknown): value is string {
  return typeof value === "string" && validChapters.has(value);
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get("chapter");

  if (!isValidChapter(chapterId)) {
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



  async function checkCommentRateLimit(
    sql: ReturnType<typeof neon<false, false>>,
    ipAddress: string
  ): Promise<boolean> {

  const secret = process.env.COMMENT_IP_HASH_SECRET;

  if (!secret) {
    throw new Error("COMMENT_IP_HASH_SECRET is not configured");
  }

  const ipHash = createHmac("sha256", secret)
    .update(ipAddress)
    .digest("hex");

  const rows = await sql`
    INSERT INTO comment_rate_limits (
      ip_hash,
      window_start,
      submission_count
    )
    VALUES (
      ${ipHash},
      date_trunc('hour', NOW()),
      1
    )
    ON CONFLICT (ip_hash, window_start)
    DO UPDATE SET
      submission_count =
        comment_rate_limits.submission_count + 1
    WHERE comment_rate_limits.submission_count < 5
    RETURNING submission_count
  `;

  return rows.length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { chapter, name, comment, turnstileToken } = body;

    if (
      !isValidChapter(chapter) ||
      typeof name !== "string" ||
      typeof comment !== "string" ||
      typeof turnstileToken !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid submission" },
        { status: 400 }
      );
    }

    const authorName = name.trim();
    const commentText = comment.trim();

    if (
      authorName.length < 1 ||
      authorName.length > 80 ||
      commentText.length < 1 ||
      commentText.length > 5000
    ) {
      return NextResponse.json(
        { error: "Invalid name or comment length" },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    if (!secretKey || !databaseUrl) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
        }),
        cache: "no-store",
      }
    );

    if (!verification.ok) {
      return NextResponse.json(
        { error: "Verification service unavailable" },
        { status: 503 }
      );
    }

    const result: {
      success: boolean;
      hostname?: string;
    } = await verification.json();




const allowedHostnames = [
  "the-block-universe.vercel.app",
  "the-block-universe-website-git-feature-reader-64db4e-cato-bf95.vercel.app",
];

if (
  !result.success ||
  !result.hostname ||
  !allowedHostnames.includes(result.hostname)
) {
  return NextResponse.json(
    { error: "Human verification failed" },
    { status: 403 }
  );
}

    const sql = neon(databaseUrl);


const ipAddress = request.headers.get("x-vercel-forwarded-for")?.trim();

if (!ipAddress) {
  return NextResponse.json(
    { error: "Unable to verify request origin" },
    { status: 400 }
  );
}

const allowed = await checkCommentRateLimit(sql, ipAddress);

if (!allowed) {
  return NextResponse.json(
    { error: "Too many comments. Please try again later." },
    { status: 429 }
  );
}

    const rows = await sql`
      INSERT INTO comments (
        chapter_id,
        author_name,
        comment_text
      )
      VALUES (
        ${chapter},
        ${authorName},
        ${commentText}
      )
      RETURNING
        id,
        chapter_id,
        author_name,
        comment_text,
        parent_id,
        created_at
    `;

    return NextResponse.json(
      { comment: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment submission failed:", error);

    return NextResponse.json(
      { error: "Unable to submit comment" },
      { status: 500 }
    );
  }
}
