import { useAuth0 } from '@auth0/auth0-react'
import CommentContent from '@duyet/components/CommentContent'
import type { Comment } from '@duyet/interfaces'

interface CommentListProps {
  comments?: Comment[]
  onDelete: (comment: Comment) => Promise<void>
}

export default function CommentList({ comments, onDelete }: CommentListProps) {
  const { user } = useAuth0()

  return (
    <div className="mt-10 space-y-6">
      {comments?.map((comment) => {
        const isAuthor = user && user.sub === comment.user.sub
        const isAdmin =
          user && user.email === process.env.NEXT_PUBLIC_AUTH0_ADMIN_EMAIL

        return (
          <CommentContent
            comment={comment}
            isAdmin={isAdmin}
            isAuthor={isAuthor}
            key={comment.created_at}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}
