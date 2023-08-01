import Image from 'next/image';

import type { Comment } from '../interfaces';
import distanceToNow from '../lib/dateRelative';
import { cn } from '../lib/utils';

type CommentProps = {
  comment: Comment;
  isAdmin?: boolean;
  isAuthor?: boolean;
  onDelete?: (comment: Comment) => void;
  className?: string;
};

export default function CommentContent({
  comment,
  isAdmin,
  isAuthor,
  onDelete,
  className,
}: CommentProps) {
  isAdmin = isAdmin || false;
  isAuthor = isAuthor || false;
  onDelete = onDelete || ((_: Comment) => {});

  return (
    <div className={cn('flex space-x-4', className)}>
      <div className="flex-shrink-0">
        <Image
          src={comment.user.picture}
          alt={comment.user.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>

      <div className="flex-grow">
        <div className="flex space-x-3">
          <b>{comment.user.name}</b>
          <time className="text-gray-400">
            {distanceToNow(comment.created_at)}
          </time>

          {(isAdmin || isAuthor) && (
            <button
              className="text-gray-400 hover:text-red-500"
              onClick={() => onDelete && onDelete(comment)}
              aria-label="Close"
            >
              x
            </button>
          )}
        </div>

        <div>{comment.text}</div>
      </div>
    </div>
  );
}
