
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      xRealIpPresent: Boolean(request.headers.get("x-real-ip")),
      xForwardedForPresent: Boolean(
        request.headers.get("x-forwarded-for")
      ),
      xVercelForwardedForPresent: Boolean(
        request.headers.get("x-vercel-forwarded-for")
      ),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
