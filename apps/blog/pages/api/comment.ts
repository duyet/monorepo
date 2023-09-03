import type { NextApiRequest, NextApiResponse } from 'next';
import fetchComment from '@duyet/libs/comment/fetchComment';
import createComments from '@duyet/libs/comment/createComment';
import deleteComments from '@duyet/libs/comment/deleteComment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return fetchComment(req, res);
    case 'POST':
      return createComments(req, res);
    case 'DELETE':
      return deleteComments(req, res);
    default: {
      res.status(400).json({ message: 'Invalid method.' });
    }
  }
}
