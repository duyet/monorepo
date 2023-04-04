import RSS from 'rss'

import type { Post } from '../interfaces'
import { getAllPosts } from '../lib/getPost'

function Rss() {
  // getServerSideProps will do the heavy lifting
}

const site_url = 'https://blog.duyet.net'

export async function getServerSideProps({ res }) {
  const posts = getAllPosts(['slug', 'title', 'excerpt', 'date'], 100000)

  const feed = new RSS({
    title: 'Tôi là Duyệt',
    description: 'Sr. Data Engineer. Rustacean at night',
    feed_url: `${site_url}/rss.xml`,
    site_url,
  })

  posts.forEach((post: Post) => {
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `${site_url}/${post.slug}`,
      date: post.date,
    })
  })

  // we send the XML to the browser
  res.setHeader('Content-Type', 'text/xml')
  res.write(feed.xml({ indent: true }))
  res.end()

  return {
    props: {},
  }
}

export default Rss
