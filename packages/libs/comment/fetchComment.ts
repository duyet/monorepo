import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

import type { Comment } from "@duyet/interfaces";
import clearUrl from "../clearUrl";

export default async function fetchComment(req: Request) {
  const url = clearUrl(req.headers.get("referer") || "");

  try {
    // get data
    const rawComments = await kv.lrange<Comment>(url, 0, -1);

    // string data to object
    const comments = rawComments.map((comment: Comment) => {
      delete comment.user.email;
      return comment;
    });

    return NextResponse.json(comments);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Unexpected error occurred." },
      { status: 400 },
    );
  }
}
