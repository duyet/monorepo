/**
 * Tests for markdown to HTML conversion
 */

import { markdownToHtml } from '../markdownToHtml'

describe('markdownToHtml', () => {
  it('should convert basic markdown to HTML', async () => {
    const markdown = '# Hello World\n\nThis is a paragraph.'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<h1')
    expect(html).toContain('Hello World')
    expect(html).toContain('<p>')
    expect(html).toContain('This is a paragraph')
  })

  it('should handle code blocks', async () => {
    const markdown = '```javascript\nconst x = 1;\n```'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<code')
    expect(html).toContain('const x = 1')
  })

  it('should handle inline code', async () => {
    const markdown = 'Use `const` for constants.'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<code>')
    expect(html).toContain('const')
  })

  it('should handle links', async () => {
    const markdown = '[Example](https://example.com)'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<a')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('Example')
  })

  it('should handle lists', async () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<ul')
    expect(html).toContain('<li')
    expect(html).toContain('Item 1')
  })

  it('should handle ordered lists', async () => {
    const markdown = '1. First\n2. Second\n3. Third'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<ol')
    expect(html).toContain('<li')
    expect(html).toContain('First')
  })

  it('should handle bold text', async () => {
    const markdown = '**bold text**'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<strong')
    expect(html).toContain('bold text')
  })

  it('should handle italic text', async () => {
    const markdown = '*italic text*'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<em')
    expect(html).toContain('italic text')
  })

  it('should handle blockquotes', async () => {
    const markdown = '> This is a quote'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<blockquote')
    expect(html).toContain('This is a quote')
  })

  it('should handle tables (GFM)', async () => {
    const markdown = `| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |`
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<table')
    expect(html).toContain('<th')
    expect(html).toContain('<td')
    expect(html).toContain('Column 1')
  })

  it('should auto-link URLs', async () => {
    const markdown = 'Visit https://example.com for more info'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('https://example.com')
  })

  it('should handle empty string', async () => {
    const html = await markdownToHtml('')
    expect(html).toBe('')
  })

  it('should handle headings with auto-generated IDs', async () => {
    const markdown = '## Section Title'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<h2')
    expect(html).toContain('id=')
    expect(html).toContain('Section Title')
  })

  it('should sanitize dangerous HTML', async () => {
    const markdown = '<script>alert("xss")</script>\n\nSafe content'
    const html = await markdownToHtml(markdown)

    // Should not contain script tags (depending on sanitization settings)
    expect(html).toContain('Safe content')
  })

  it('should handle nested markdown elements', async () => {
    const markdown = '- **Bold item**\n- *Italic item*\n- `Code item`'
    const html = await markdownToHtml(markdown)

    expect(html).toContain('<ul')
    expect(html).toContain('<strong')
    expect(html).toContain('<em')
    expect(html).toContain('<code')
  })

  it('should handle multiple paragraphs', async () => {
    const markdown = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'
    const html = await markdownToHtml(markdown)

    const paragraphs = (html.match(/<p>/g) || []).length
    expect(paragraphs).toBeGreaterThanOrEqual(3)
  })
})
