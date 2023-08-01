'use client';

import CommentForm from './Form';
import CommentList from './List';
import useComments from './hooks/useComment';

type Props = {
  className?: string;
};

export default function Comment(props: Props) {
  const { text, setText, comments, onSubmit, onDelete } = useComments();

  return (
    <div {...props}>
      <CommentForm onSubmit={onSubmit} text={text} setText={setText} />
      <CommentList comments={comments} onDelete={onDelete} />
    </div>
  );
}
