'use client'; // Error components must be Client components

import { Error } from '@duyet/components';

export default function Page({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <Error error={error} reset={reset} />;
}
