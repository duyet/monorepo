import Container from '@duyet/components/Container'

export const metadata = {
  title: 'AI',
  description: 'How I use AI.',
}

export default function AI() {
  return (
    <div className="mb-16 space-y-6 leading-loose">
      <Container className="mb-8 max-w-2xl md:mb-16">
        <h1 className="my-10 text-6xl font-bold lg:text-7xl">AI</h1>
        <p>
          None of the contents in my blog was written by an AI tool. I have used
          AI for English sentences correction, ChatGPT and Claude 3.
        </p>

        <p>
          I use different LLM tools for coding, mostly Github Copilot + NeoVim.
        </p>
      </Container>
    </div>
  )
}
