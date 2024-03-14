'use client';

import { Auth0Provider } from '@duyet/components';
import CommentForm from './form';
import CommentList from './list';
import useComments from './hooks/use-comment';

interface CommentProps {
  className?: string;
}

export default function Comment(props: CommentProps) {
  const { text, setText, comments, onSubmit, onDelete } = useComments();

  return (
    <Auth0Provider>
      <div {...props}>
        <CommentForm onSubmit={onSubmit} setText={setText} text={text} />
        <CommentList comments={comments} onDelete={onDelete} />
      </div>
    </Auth0Provider>
  );
}
