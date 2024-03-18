'use client';

import CommentForm from './form';
import useComments from './hooks/use-comment';
import CommentList from './list';

interface CommentProps {
  className?: string;
}

export default function Wrapper(props: CommentProps) {
  const { text, setText, comments, onSubmit, onDelete } = useComments();

  return (
    <div {...props}>
      <CommentForm onSubmit={onSubmit} setText={setText} text={text} />
      <CommentList comments={comments} onDelete={onDelete} />
    </div>
  );
}
