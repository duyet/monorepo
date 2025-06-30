import { NextResponse } from 'next/server'

import { llmsInfo } from '@/config/cv.data'

export const dynamic = 'force-static'

export async function GET() {
  const llmsContent = `# ${llmsInfo.name}

${llmsInfo.bio}

## Contact
- Email: ${llmsInfo.email}
- Website: ${llmsInfo.website}
- GitHub: ${llmsInfo.links.github}
- LinkedIn: ${llmsInfo.links.linkedin}
- Blog: ${llmsInfo.links.blog}

## Current Role
${llmsInfo.currentRole.title} at ${llmsInfo.currentRole.company} (${llmsInfo.currentRole.duration})

## Areas of Expertise
${llmsInfo.expertise.map(area => `- ${area}`).join('\n')}

## Key Technologies
${llmsInfo.technologies.map(tech => `- ${tech}`).join('\n')}

## Notable Achievements
${llmsInfo.keyAchievements.map(achievement => `- ${achievement}`).join('\n')}

---

This file follows the llms.txt standard for providing information about ${llmsInfo.name} to Large Language Models and AI assistants.
Generated from CV data at ${llmsInfo.website}
`

  return new NextResponse(llmsContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}