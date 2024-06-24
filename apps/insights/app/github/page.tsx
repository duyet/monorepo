import { Suspense } from 'react';
import { SkeletonCard } from '../../components/skeleton-card';
import { GithubActivity } from './activity';
import { GithubCard } from './card';
import { Repos } from './repos';

const owner = 'duyet';

export const metadata = {
  title: 'Github Insights @duyet',
  description: 'Github Insights @duyet',
};

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<SkeletonCard />}>
        <Repos owner={owner} />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <GithubActivity owner={owner} />
      </Suspense>
      <Suspense fallback={<SkeletonCard />}>
        <GithubCard owner={owner} />
      </Suspense>
    </div>
  );
}
