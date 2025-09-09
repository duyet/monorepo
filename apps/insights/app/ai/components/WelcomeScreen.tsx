'use client'

import { Bot, Github, Clock, Globe, Users, Zap } from 'lucide-react'

interface WelcomeScreenProps {
  onExampleClick: (query: string) => void
}

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const examples = [
    {
      icon: Github,
      category: 'GitHub',
      query: 'Show me my GitHub activity this week',
      description: 'Commits, PRs, and contribution patterns',
    },
    {
      icon: Clock,
      category: 'WakaTime',
      query: 'What are my coding patterns this month?',
      description: 'Languages, hours, and productivity trends',
    },
    {
      icon: Globe,
      category: 'Website',
      query: 'How is my website traffic performing?',
      description: 'Page views, visitors, and popular content',
    },
    {
      icon: Users,
      category: 'Analytics',
      query: 'Analyze my user engagement metrics',
      description: 'Sessions, events, and user behavior',
    },
    {
      icon: Zap,
      category: 'AI Usage',
      query: 'Show me my Claude Code usage patterns',
      description: 'Token usage, conversations, and efficiency',
    },
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">AI Analytics Assistant</h2>
        <p className="text-muted-foreground">
          Ask me anything about your development metrics and analytics
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Try these example queries:
        </p>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(example.query)}
              className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <example.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {example.category}
                  </span>
                </div>
                <p className="text-sm font-medium">{example.query}</p>
                <p className="text-xs text-muted-foreground">
                  {example.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Privacy-first • Powered by transformers.js</span>
        </div>
        <p className="text-xs text-muted-foreground">
          All AI processing happens locally in your browser. No data is sent to external servers.
        </p>
      </div>
    </div>
  )
}