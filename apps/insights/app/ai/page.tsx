import { ChatInterface } from './components/ChatInterface'

export const metadata = {
  title: 'AI Assistant | @duyet Insights',
  description:
    'AI-powered analytics assistant for natural language queries about your development metrics and insights.',
}

export default function AIPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="mt-1 text-muted-foreground">
          Ask questions about your development metrics in natural language
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <ChatInterface />
      </div>
    </div>
  )
}

export const dynamic = 'force-static'
export const revalidate = 3600