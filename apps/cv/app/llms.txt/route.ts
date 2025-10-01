import { NextResponse } from 'next/server'

import { cvData } from '@/config/cv.data'

export const dynamic = 'force-static'

// Type guard to check for a JSX-like element, improving readability and reducing repetition.
function isJsxElement(
  value: unknown,
): value is { props: { children?: unknown; text?: unknown } } {
  return (
    value !== null &&
    typeof value === 'object' &&
    'props' in value &&
    (value as { props: unknown }).props !== null
  )
}

function extractTextContent(content: unknown): string {
  if (content === null || typeof content === 'undefined') {
    return ''
  }
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content)
  }
  if (Array.isArray(content)) {
    return content.map(extractTextContent).join('')
  }
  if (isJsxElement(content)) {
    // Recursively extract content from children if they exist.
    if ('children' in content.props) {
      return extractTextContent(content.props.children)
    }
    // Otherwise, check for a text prop as a fallback.
    if ('text' in content.props) {
      return String(content.props.text)
    }
  }
  return ''
}

// `formatResponsibility` can now be a simple, clear alias for the robust extraction function.
function formatResponsibility(item: unknown): string {
  return extractTextContent(item)
}

// Extract date formatting logic to reduce repetition
function formatDateRange(from: Date, to?: Date): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  return to
    ? `${formatDate(from)} - ${formatDate(to)}`
    : `${formatDate(from)} - Present`
}

export async function GET() {
  const { personal, experience, education, skills } = cvData

  const llmsContent = `# ${personal.name} | ${personal.title}

${personal.contacts.map((contact) => contact.label).join(' · ')}

${personal.overview}

## Experience

${experience
  .map((exp) => {
    const period = formatDateRange(exp.from, exp.to)

    return `### ${exp.title}
${exp.company} (${period})

${exp.responsibilities.map((resp) => `• ${formatResponsibility(resp.item)}`).join('\n')}`
  })
  .join('\n\n')}

## Education

${education
  .map((edu) => {
    const parts = [
      `### ${edu.major}`,
      edu.university,
      edu.thesis,
      edu.thesisUrl ? `Thesis URL: ${edu.thesisUrl}` : '',
    ].filter(Boolean)
    return parts.join('\n')
  })
  .join('\n\n')}

## Skills

${skills
  .map((skillGroup) => {
    const skillList = skillGroup.skills.map((skill) => skill.name).join(', ')
    return `**${skillGroup.name}:** ${skillList}.`
  })
  .join('\n\n')}

---

This file follows the llms.txt standard for providing CV information to Large Language Models and AI assistants.
Generated from: https://duyet.net`

  return new NextResponse(llmsContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
