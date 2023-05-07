import { RefreshCw } from 'lucide-react'

import Container from '../components/Container'

export default function Loading() {
  return (
    <Container>
      <div className='py-20 text-center'>
        <div className='flex flex-row gap-4'>
          <RefreshCw className='animate-spin' />
          <span>Loading ...</span>
        </div>
      </div>
    </Container>
  )
}
