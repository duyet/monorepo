"use client"; // Error components must be Client components

import ErrorComponent from "@duyet/components/Error";

export default function Page({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} />;
}
