import Link from 'next/link'

import Container from '@duyet/components/Container'
import Header from '@duyet/components/Header'

interface LinkItem {
  name: string
  link?: string
}

const skills: LinkItem[] = [
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
]

const links: LinkItem[] = [
  { name: 'Resume', link: 'https://cv.duyet.net' },
  { name: 'Resume (PDF)', link: 'https://cv.duyet.net/pdf' },
  { name: 'Github', link: 'https://github.com/duyet' },
]

export default function About() {
  return (
    <>
      <Header longText="About" />
      <Container>
        <div className="text-lg">
          <strong>Data Engineer</strong> with 6+ years of experience. I am
          confident in my knowledge of Data Engineering concepts, best practices
          and state-of-the-art data and Cloud technologies.
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <div className="text-lg">
            Connect with me:{' '}
            {links.map(({ name, link = '#' }, index) => (
              <span key={name}>
                {index > 0 && ', '}
                <Link href={link} className="underline" target="_blank">
                  {name}
                </Link>
              </span>
            ))}
          </div>

          <div className="text-lg">
            Skills & stacks:{' '}
            {skills.map(({ name, link }, index) => (
              <span key={name}>
                {index > 0 && ', '}
                {link ? (
                  <Link href={link} className="underline" target="_blank">
                    {name}
                  </Link>
                ) : (
                  <span>{name}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </>
  )
}
