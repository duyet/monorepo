import { Suspense } from 'react';
import { SkeletonCard } from '../../components/skeleton-card';
import { GithubCard } from './card';
import { Repos } from './repos';

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<SkeletonCard />}>
        <Repos />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <GithubCard />
      </Suspense>
    </div>
  );
}
