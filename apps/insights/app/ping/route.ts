import { NextResponse } from "next/server";

export const GET = () => {
  return NextResponse.json(
    { status: "ok" },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
};

export const dynamic = "force-static" as const;
