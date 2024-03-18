import { NextResponse } from "next/server";
import type { User, Comment } from "@duyet/interfaces";
import getUser from "../getUser";
import clearUrl from "../clearUrl";

export default async function deleteComments(req: Request) {
  const url = clearUrl(req.headers.get("referer") || "");
  const { comment }: { url: string; comment: Comment } = await req.json();
  const authorization = req.headers.get("authorization");

  if (!comment || !authorization) {
    return NextResponse.json(
      { message: "Missing parameter." },
      { status: 400 },
    );
  }

  try {
    // verify user token
    const user: User = await getUser(authorization);
    if (!user) {
      return NextResponse.json(
        { message: "Need authorization." },
        { status: 400 },
      );
    }

    comment.user.email = user.email;

    const isAdmin = process.env.NEXT_PUBLIC_AUTH0_ADMIN_EMAIL === user.email;
    const isAuthor = user.sub === comment.user.sub;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { message: "Need authorization." },
        { status: 400 },
      );
    }

    // TODO: delete
    // await kv.lrem(url, 0, JSON.stringify(comment))

    return NextResponse.json(comment);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Unexpected error occurred." },
      { status: 400 },
    );
  }
}
