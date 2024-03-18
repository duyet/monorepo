import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

import type { Comment } from "@duyet/interfaces";
import clearUrl from "../clearUrl";

export default async function fetchComment(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const url = clearUrl(req.headers.referer || "");

  try {
    // get data
    const rawComments = await kv.lrange<Comment>(url, 0, -1);

    // string data to object
    const comments = rawComments.map((comment: Comment) => {
      delete comment.user.email;
      return comment;
    });

    return res.status(200).json(comments);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: "Unexpected error occurred." });
  }
}
