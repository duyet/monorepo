import { Suspense } from 'react';
import { SkeletonCard } from '../../components/skeleton-card';
import { Cloudflare } from './cloudflare';
import { PostHog } from './posthog';

export default function Page() {
  return (
    <>
      <Suspense fallback={<SkeletonCard />}>
        <Cloudflare />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <PostHog />
      </Suspense>
    </>
  );
}
