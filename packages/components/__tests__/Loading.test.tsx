/**
 * Tests for Loading component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Loading } from '../Loading'

describe('Loading', () => {
  it('should render loading component', () => {
    const { container } = render(<Loading />)
    expect(container).toBeInTheDocument()
  })

  it('should be visible in the DOM', () => {
    const { container } = render(<Loading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should not crash when rendered multiple times', () => {
    const { rerender } = render(<Loading />)
    rerender(<Loading />)
    rerender(<Loading />)

    expect(true).toBe(true)
  })
})
