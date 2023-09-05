import Image from 'next/image';
import { BarChart, BarList, Legend, DonutChart } from '@duyet/components';
import { cn } from '@duyet/libs/utils';
import TextDataSource from '../../components/text-data-source';

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

  return `https://github-readme-stats.vercel.app/api?${urlParams.toString()}`;
};

const STATIC_CHARTS: {
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
        alt="Wakatime"
        className="mt-3"
        height={30}
        src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
        unoptimized
        width={200}
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
          categories={['Coding Hours']}
          data={codingActivity}
          index="range.date"
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
              category="percent"
              className="w-44 mb-10"
              data={languages}
              index="name"
              showLabel
              variant="pie"
            />
            <Legend
              categories={top10Languages.map((language) => language.name)}
              className="w-full md:w-min"
            />
          </div>
        </div>

        <TextDataSource>Wakatime (All Times)</TextDataSource>
      </div>

      {STATIC_CHARTS.map(({ title, source, url, className, extra }) => (
        <div className={cn('p-3', borderClasse, className)} key={title}>
          {title ? <div className="font-bold mb-5">{title}</div> : null}

          <div className="flex flex-col items-stretch block dark:hidden">
            <Image alt={title || ''} height={500} src={url.light} width={800} />
          </div>

          <div className="flex flex-col gap-5 hidden dark:block">
            <Image alt={title || ''} height={500} src={url.dark} width={800} />
          </div>

          {extra}

          <TextDataSource>{source}</TextDataSource>
        </div>
      ))}
    </div>
  );
}

interface WakaCodingActivity {
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
}

async function getWakaCodingActivity() {
  const raw = await fetch(WAKA_CODING_ACTIVITY_API);

  // eslint-disable-next-line -- Temporarily avoids the lint error problem
  const data: WakaCodingActivity['data'] = (await raw.json()).data;

  return data.map((item) => ({
    ...item,
    'Coding Hours': (item.grand_total.total_seconds / 3600).toFixed(1),
  }));
}

interface WakaLanguages {
  data: {
    name: string;
    percent: number;
    color: string;
  }[];
}
async function getWakaLanguages() {
  const raw = await fetch(WAKA_LANGUAGES_API);

  // eslint-disable-next-line -- Temporarily avoids the lint error problem
  const data: WakaLanguages['data'] = (await raw.json()).data;

  return data;
}
