import Image from 'next/image'

const urls = [
  'https://wakatime.com/share/@8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9/bec141b5-a112-445b-8c79-c2a5f37e3380.svg',
  'https://wakatime.com/share/@8d67d3f3-1ae6-4b1e-a8a1-32c57b3e05f9/fcfd3d44-340f-4a50-ba31-1c97b66a5a62.svg',
  'https://github-readme-stats.vercel.app/api?username=duyet&show_icons=true&theme=vue&hide_border=true&custom_title=@duyet',
]

export default async function Wakatime() {
  return (
    <div className='space-y-6 mt-10'>
      <div className='flex flex-col gap-5'>
        {urls.map((url) => (
          <Image key={url} src={url} width={800} height={500} alt='' />
        ))}
      </div>
    </div>
  )
}
