import IORedis, { Redis } from 'ioredis'

function fixUrl(url: string) {
  if (!url) {
    return ''
  }

  return url
}

class ClientRedis {
  static instance: Redis

  constructor() {
    throw new Error('Use Singleton.getInstance()')
  }

  static getInstance(): Redis | null {
    if (!ClientRedis.instance) {
      ClientRedis.instance = new IORedis(fixUrl(process.env.REDIS_URL!))
    }
    return ClientRedis.instance
  }
}

export default ClientRedis.getInstance()
