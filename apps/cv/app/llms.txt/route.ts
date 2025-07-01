import { NextResponse } from 'next/server'

import { cvData } from '@/config/cv.data'

export const dynamic = 'force-static'

function formatResponsibility(item: unknown): string {
  if (typeof item === 'string') {
    return item
  }
  // For JSX elements, extract just the text content
  if (typeof item === 'object' && item && 'props' in item && 
      typeof item.props === 'object' && item.props && 'children' in item.props) {
    return extractTextContent(item.props.children)
  }
  return String(item)
}

function extractTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    return content.map(extractTextContent).join('')
  }
  if (typeof content === 'object' && content && 'props' in content && 
      typeof content.props === 'object' && content.props && 'children' in content.props) {
    return extractTextContent(content.props.children)
  }
  if (typeof content === 'object' && content && 'props' in content && 
      typeof content.props === 'object' && content.props && 'text' in content.props) {
    return String(content.props.text)
  }
  return ''
}

export async function GET() {
  const { personal, experience, education } = cvData

  const llmsContent = `# ${personal.name} | ${personal.title}

${personal.contacts.map(contact => contact.label).join(' · ')}

Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing. Proficient in ClickHouse, Spark, Airflow, Python, Rust.

## Experience

${experience.map(exp => {
  const period = exp.to 
    ? `${exp.from.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - ${exp.to.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
    : `${exp.from.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - Present`
  
  return `### ${exp.title}
${exp.company} (${period})

${exp.responsibilities.map(resp => `• ${formatResponsibility(resp.item)}`).join('\n')}`
}).join('\n\n')}

## Education

${education.map(edu => {
  return `### ${edu.major}
${edu.university}
${edu.thesis}
${edu.thesisUrl ? `Thesis URL: ${edu.thesisUrl}` : ''}`
}).join('\n\n')}

## Skills

**Data Engineering:** ClickHouse, Spark, Kafka, Airflow, AWS, BigQuery, Data Studio, Python, Rust, Typescript.

**DevOps:** CI/CD, Kubernetes, Helm.

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