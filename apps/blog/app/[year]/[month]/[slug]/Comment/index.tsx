'use client'

import CommentForm from './comment-form'
import CommentList from './comment-list'
import useComments from './hooks/use-comment'

interface CommentProps {
  className?: string
}

export default function Comment(props: CommentProps) {
  const { text, setText, comments, onSubmit, onDelete } = useComments()

  return (
    <div {...props}>
      <CommentForm onSubmit={onSubmit} setText={setText} text={text} />
      <CommentList comments={comments} onDelete={onDelete} />
    </div>
  )
}
