
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return NextResponse.json(
      { error: "Comment verification unavailable" },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { siteKey },
    { headers: { "Cache-Control": "no-store" } }
  );
}
