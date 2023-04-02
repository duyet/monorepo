import Container from '../components/Container'

export default function Stats() {
  return (
    <Container>
      <div className='space-y-6'>
        <div className='flex flex-col gap-5'>
          <img src='https://wakatime.com/share/@8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9/e3bcf43a-620f-416f-b8ac-1f74fa16e4e2.png' />
          <img src='https://wakatime.com/share/@8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9/5fd68fc4-d79a-432b-8ae0-8c2474b13de0.png' />
          <img src='https://github-readme-stats.vercel.app/api?username=duyet&show_icons=true&theme=vue&hide_border=true&custom_title=@duyet' />
        </div>
      </div>
    </Container>
  )
}
