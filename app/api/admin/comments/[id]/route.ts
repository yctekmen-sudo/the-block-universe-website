
import { verifyAdminSession } from "@/lib/comment-admin-auth";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = process.env.COMMENT_ADMIN_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  if (!secret || !databaseUrl) {
    return NextResponse.json(
      { error: "Administrator service unavailable" },
      { status: 503 }
    );
  }

  const expectedOrigin = new URL(request.url).origin;
  const suppliedOrigin = request.headers.get("origin");

  if (suppliedOrigin !== expectedOrigin) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }


  const session = request.cookies.get("comment_admin_session")?.value;

  if (!verifyAdminSession(session, secret)) {
    return NextResponse.json(
      { error: "Administrator authentication required" },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid comment ID" },
      { status: 400 }
    );
  }

  const sql = neon(databaseUrl);

  const deleted = await sql`
    DELETE FROM comments
    WHERE id = ${id}::bigint
    RETURNING id
  `;

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "Comment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
