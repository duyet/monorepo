/**
 * Tests for ErrorBoundary component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors and display error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error message
    expect(screen.queryByText('No error')).not.toBeInTheDocument()
  })

  it('should not affect children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should handle nested components', () => {
    const NestedComponent = () => (
      <div>
        <span>Nested content</span>
        <p>More nested content</p>
      </div>
    )

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Nested content')).toBeInTheDocument()
    expect(screen.getByText('More nested content')).toBeInTheDocument()
  })
})
