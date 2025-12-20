import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET(): NextResponse {
  return NextResponse.json(
    {
      status: "ok",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
