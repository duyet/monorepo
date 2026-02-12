import { StartScreenPrompt } from '@openai/chatkit'

export const WORKFLOW_ID =
  process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? ''

export const CREATE_SESSION_ENDPOINT = '/api/create-session'

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: 'What can you do?',
    prompt: 'What can you do?',
    icon: 'sparkle-double',
  },
  {
    label: 'Latest blog posts',
    prompt: 'Show me blog.duyet.net latest blog posts',
    icon: 'book-open',
  },
  {
    label: 'Duyet Resume',
    prompt: 'Show me duyet resume',
    icon: 'book-open',
  },
  {
    label: 'Duyet Github',
    prompt: 'Show me duyet github',
    icon: 'compass',
  },
  {
    label: 'Some insights',
    prompt: 'Show me some insights',
    icon: 'bolt',
  },
]

export const PLACEHOLDER_INPUT = 'Ask anything...'

export const GREETING = 'How can I help you today?'

export const MODELS = [
  {
    id: 'clear',
    label: 'Clear',
    description: 'Focus and helpful',
  },
  {
    id: 'crisp',
    label: 'Crisp',
    description: 'Concise and factual',
  },
]
