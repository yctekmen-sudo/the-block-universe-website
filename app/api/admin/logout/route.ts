
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expectedOrigin = new URL(request.url).origin;
  const suppliedOrigin = request.headers.get("origin");

  if (suppliedOrigin !== expectedOrigin) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("comment_admin_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/admin",
    maxAge: 0,
  });

  return response;
}
