import createComments from '@duyet/libs/comment/createComment';
import deleteComments from '@duyet/libs/comment/deleteComment';
import fetchComment from '@duyet/libs/comment/fetchComment';

export async function GET(req: Request) {
  return fetchComment(req);
}

export async function POST(req: Request) {
  return createComments(req);
}

export async function DELETE(req: Request) {
  return deleteComments(req);
}
