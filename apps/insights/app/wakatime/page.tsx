import { BarChart, BarList, DonutChart, Legend } from '@duyet/components';
import { cn } from '@duyet/libs/utils';
import Image from 'next/image';
import { StaticCard } from '../../components/static-card';
import { TextDataSource } from '../../components/text-data-source';

export const metadata = {
  title: '@duyet Coding Insights',
  description: 'Coding Insights data collected from Wakatime.',
};

const WAKA_CODING_ACTIVITY_API =
  'https://wakatime.com/share/@duyet/2fe9921d-4bd2-4a6f-87a1-5cc2fcc5a9fc.json';

const WAKA_LANGUAGES_API =
  'https://wakatime.com/share/@duyet/8087c715-c108-487c-87ba-64d545ac95a8.json';

const borderClasses = 'border rounded dark:border-gray-800';

export default async function Wakatime() {
  const codingActivity = await getWakaCodingActivity();
  const languages = await getWakaLanguages();
  const top10Languages = languages.slice(0, 10);

  return (
    <div className="mt-10 space-y-6">
      <div className="mb-10">
        <BarChart
          categories={['Coding Hours']}
          data={codingActivity}
          index="range.date"
        />
        <TextDataSource>Wakatime (Last 30 days)</TextDataSource>
      </div>

      <div className={cn('mb-10 p-5', borderClasses)}>
        <div className="flex flex-row flex-wrap items-center gap-10">
          <div className="basis-full md:basis-1/2">
            <div className="text-bold mb-4 flex flex-row justify-between">
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

          <div className="flex grow flex-col items-center">
            <DonutChart
              category="percent"
              className="mb-10 w-44"
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

      <StaticCard
        extra={
          <Image
            alt="Wakatime"
            className="mt-3"
            height={30}
            src="https://wakatime.com/badge/user/8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9.svg"
            unoptimized
            width={200}
          />
        }
        source="Wakatime (Last Year)"
        title="Coding Activity Calendar"
        url={{
          light:
            'https://wakatime.com/share/@duyet/bf2b1851-7d8f-4c32-9033-f0ac18362d9e.svg',
          dark: 'https://wakatime.com/share/@duyet/b7b8389a-04ba-402f-9095-b1748a5be49c.svg',
        }}
      />
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
  const data = ((await raw.json()) as WakaCodingActivity).data;

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
  const data = ((await raw.json()) as WakaLanguages).data;

  return data;
}
