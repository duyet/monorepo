import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import type { Comment } from "@duyet/interfaces";
import getUser from "../getUser";
import clearUrl from "../clearUrl";

export default async function createComments(req: NextRequest) {
  const url = clearUrl(req.headers.get("referer") || "");
  const { text } = await req.json();
  const authorization = req.headers.get("authorization");

  if (!text || !authorization) {
    return NextResponse.json(
      { message: "Missing parameter." },
      { status: 400 },
    );
  }

  try {
    // verify user token
    const user = await getUser(authorization);
    if (!user) {
      return NextResponse.json(
        { message: "Need authorization." },
        { status: 400 },
      );
    }

    const { name, picture, sub, email } = user;

    const comment: Comment = {
      id: nanoid(),
      created_at: Date.now(),
      url,
      text,
      user: { name, picture, sub, email },
    };

    // write data
    await kv.lpush(url, JSON.stringify(comment));

    return NextResponse.json(comment);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Unexpected error occurred." },
      { status: 400 },
    );
  }
}
