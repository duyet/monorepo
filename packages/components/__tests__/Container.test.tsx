/**
 * Tests for Container component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Container } from '../Container'

describe('Container', () => {
  it('should render children', () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should accept className prop', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild
    expect(containerElement).toHaveClass('custom-class')
  })

  it('should render multiple children', () => {
    render(
      <Container>
        <div>First child</div>
        <div>Second child</div>
        <div>Third child</div>
      </Container>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
    expect(screen.getByText('Third child')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    const { container } = render(<Container>{null}</Container>)
    expect(container.firstChild).toBeInTheDocument()
  })
})
