import Container from '@duyet/components/Container';
import { Projects } from '../../components/projects';

interface Link {
  name: string;
  link?: string;
}

const skills: Link[] = [
  {
    name: 'Python',
    link: 'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=python',
  },
  {
    name: 'Rust',
    link: 'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=rust',
  },
  {
    name: 'Javascript',
    link: 'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=javascript',
  },
  {
    name: 'Spark',
  },
  {
    name: 'Airflow',
    link: 'https://blog.duyet.net/tag/airflow/',
  },
  {
    name: 'AWS',
  },
  {
    name: 'GCP',
  },
];

const links: Link[] = [
  { name: 'Resume (PDF)', link: 'https://cv.duyet.net' },
  { name: 'Github', link: 'https://github.com' },
];

export default function About() {
  return (
    <div className="mb-16 space-y-6 leading-loose">
      <Container className="mb-8 md:mb-16">
        <h1 className="my-10 text-6xl font-bold lg:text-7xl">Duyệt</h1>
        <p>
          <strong>Data Engineer</strong> with 5+ years of experience. I am
          confident in my knowledge of Data Engineering concepts, best practices
          and state-of-the-art data and Cloud technologies.
        </p>

        <div className="flex flex-col gap-5">
          <p>
            {links.map(({ name, link = '#' }) => (
              <a
                className="mr-4 text-blue-600"
                href={link}
                key={name}
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                {name}
              </a>
            ))}
          </p>

          <p>
            Skills & stacks:{' '}
            {skills.map(({ name, link = '#' }) => (
              <a
                className="mr-4 inline-block text-blue-600"
                href={link}
                key={name}
                rel="noopener noreferrer"
                target="_blank"
              >
                {name}
              </a>
            ))}
          </p>
        </div>
      </Container>

      <div className="lg:m-15 m-5 md:mx-20">
        <Projects />
      </div>
    </div>
  );
}
