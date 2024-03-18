'use client';

import Auth0Provider from '@duyet/components/Auth0Provider';
import Wrapper from './wrapper';

interface CommentProps {
  className?: string;
}

export default function Comment(props: CommentProps) {
  return (
    <Auth0Provider>
      <Wrapper {...props} />
    </Auth0Provider>
  );
}
