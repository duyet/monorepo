type Link = {
  name: string
  link?: string
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
]

const links: Link[] = [
  { name: 'Resume (PDF)', link: 'https://cv.duyet.net' },
  { name: 'Github', link: 'https://github.com' },
]

export default function About() {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Tôi là Duyệt</h1>
      <p>
        Being a <strong>Data Engineer</strong> with 5+ years of experience.
        I am confident in my knowledge of data engineering
        concepts as well as best practices and also familiarity with
        state-of-the-art data and Cloud technologies
      </p>

      <div className='flex flex-col'>
        <p className='mb-5'>
          Skills & stacks:{' '}
          {skills.map(({ name, link = '#' }) => (
            <a
              key={name}
              href={link}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 mr-4'
            >
              {name}
            </a>
          ))}
        </p>

        <p>
          {links.map(({ name, link = '#' }) => (
            <a
              key={name}
              href={link}
              target='_blank'
              className='text-blue-600 mr-4'
              rel='nofollow noopener noreferrer'
            >
              {name}
            </a>
          ))}
        </p>
      </div>
    </div>
  )
}
