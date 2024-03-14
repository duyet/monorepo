'use client';

import CommentForm from './form';
import CommentList from './list';
import useComments from './hooks/use-comment';

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
