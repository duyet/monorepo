import { useAuth0 } from '@auth0/auth0-react';

import type { Comment } from '../../../../../interfaces';
import CommentContent from '../../../../../components/CommentContent';

type CommentListProps = {
  comments?: Comment[];
  onDelete: (comment: Comment) => Promise<void>;
};

export default function CommentList({ comments, onDelete }: CommentListProps) {
  const { user } = useAuth0();

  return (
    <div className="space-y-6 mt-10">
      {comments?.map((comment) => {
        const isAuthor = user && user.sub === comment.user.sub;
        const isAdmin =
          user && user.email === process.env.NEXT_PUBLIC_AUTH0_ADMIN_EMAIL;

        return (
          <CommentContent
            key={comment.created_at}
            comment={comment}
            isAdmin={isAdmin}
            isAuthor={isAuthor}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}
