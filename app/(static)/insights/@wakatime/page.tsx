import Image from 'next/image';

import {
  BarChart,
  DonutChart,
  Legend,
  BarList,
} from '../../../../components/Tremor';
import { cn } from '../../../../lib/utils';
import TextDataSource from '../TextDataSource';

// See: https://github.com/anuraghazra/github-readme-stats
const githubStatUrl = (params: { theme: string }) => {
  const urlParams = new URLSearchParams({
    username: 'duyet',
    custom_title: `@duyet's github stats`,
    hide_border: 'true',
    show_icons: 'true',
    include_all_commits: 'true',
    count_private: 'true',
    text_bold: 'false',
    ...params,
  });

  return `https://github-readme-stats.vercel.app/api?${urlParams}`;
};

const static_charts: {
  title?: string;
  source?: string;
  className?: string;
  extra?: React.ReactNode;
  url: { light: string; dark: string };
}[] = [
  {
    title: 'Coding Activity Calendar',
    source: 'Wakatime (Last year)',
    url: {
      light:
        'https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg',
      dark: 'https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg',
    },
    extra: (
      <Image
        src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
        alt="Wakatime"
        width={200}
        height={30}
        unoptimized
        className="mt-3"
      />
    ),
  },
  {
    source: 'Github',
    className: 'dark:border-0 dark:p-0',
    url: {
      light: githubStatUrl({ theme: 'default' }),
      dark: githubStatUrl({ theme: 'dracula' }),
    },
  },
];

const WAKA_CODING_ACTIVITY_API =
  'https://wakatime.com/share/@duyet/2fe9921d-4bd2-4a6f-87a1-5cc2fcc5a9fc.json';

const WAKA_LANGUAGES_API =
  'https://wakatime.com/share/@duyet/8087c715-c108-487c-87ba-64d545ac95a8.json';

const borderClasse = 'border rounded dark:border-gray-800';

export default async function Wakatime() {
  const codingActivity = await getWakaCodingActivity();
  const languages = await getWakaLanguages();
  const top10Languages = languages.slice(0, 10);

  return (
    <div className="space-y-6 mt-10">
      <div className="mb-10">
        <BarChart
          data={codingActivity}
          index={'range.date'}
          categories={['Coding Hours']}
        />
        <TextDataSource>Wakatime (Last 30 days)</TextDataSource>
      </div>

      <div className={cn('mb-10 p-5', borderClasse)}>
        <div className="flex flex-row flex-wrap items-center gap-10">
          <div className="basis-full md:basis-1/2">
            <div className="flex flex-row justify-between text-bold mb-4">
              <span className="font-bold">Top 10 tracked by Wakatime</span>
              <span className="font-bold">%</span>
            </div>
            <BarList
              data={top10Languages.map((language) => ({
                name: language.name,
                value: language.percent,
              }))}
            />
          </div>

          <div className="flex flex-col items-center grow">
            <DonutChart
              data={languages}
              category="percent"
              index="name"
              showLabel={true}
              variant="pie"
              className="w-44 mb-10"
            />
            <Legend
              categories={top10Languages.map((language) => language.name)}
              className="w-full md:w-min"
            />
          </div>
        </div>

        <TextDataSource>Wakatime (All Times)</TextDataSource>
      </div>

      {static_charts.map(({ title, source, url, className, extra }) => (
        <div key={title} className={cn('p-3', borderClasse, className)}>
          {title && <div className="font-bold mb-5">{title}</div>}

          <div className="flex flex-col items-stretch block dark:hidden">
            <Image src={url.light} width={800} height={500} alt={title || ''} />
          </div>

          <div className="flex flex-col gap-5 hidden dark:block">
            <Image src={url.dark} width={800} height={500} alt={title || ''} />
          </div>

          {extra}

          <TextDataSource>{source}</TextDataSource>
        </div>
      ))}
    </div>
  );
}

type WakaCodingActivity = {
  data: {
    range: {
      start: string;
      end: string;
      date: string;
      text: string;
      timezone: string;
    };
    grand_total: {
      hours: number;
      minutes: number;
      total_seconds: number;
      digital: string;
      text: string;
    };
  }[];
};

async function getWakaCodingActivity() {
  const raw = await fetch(WAKA_CODING_ACTIVITY_API);
  const data: WakaCodingActivity['data'] = (await raw.json()).data;

  return data.map((item) => ({
    ...item,
    'Coding Hours': (item.grand_total.total_seconds / 3600).toFixed(1),
  }));
}

type WakaLanguages = {
  data: {
    name: string;
    percent: number;
    color: string;
  }[];
};
async function getWakaLanguages() {
  const raw = await fetch(WAKA_LANGUAGES_API);
  const data: WakaLanguages['data'] = (await raw.json()).data;

  return data;
}
