import Image from 'next/image'

import Container from '../components/Container'

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
  { name: 'Résumé (PDF)', link: 'https://cv.duyet.net' },
  { name: 'Github', link: 'https://github.com' },
]

function About() {
  return (
    <>
      <Container>
        <div className='space-y-6'>
          <h1 className='text-2xl font-bold'>Tôi là Duyệt</h1>
          <p>
            Being a <strong>Data Engineer</strong> with 5+ years of experience,
            I’m currently working for Fossil Group with a Terabyte-scale Data
            Platform based on Kubernetes. I am confident in my knowledge of data
            engineering concepts as well as best practices and also familiarity
            with state-of-the-art data and cloud technologies
          </p>

          <div className='flex flex-col'>
            <p className='mb-5'>
              Skills & stacks:{' '}
              {skills.map(({ name, link = '#' }) => (
                <a
                  key={name}
                  href={link}
                  target='_blank'
                  className='text-sky-600 mr-4'
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
                  className='text-sky-600 mr-4'
                  rel='nofollow noopener noreferrer'
                >
                  {name}
                </a>
              ))}
            </p>
          </div>
        </div>
      </Container>

      <div className='container max-w-4xl m-auto px-4 mt-20'></div>
    </>
  )
}

export default About
