import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { DropZone } from '../../src/components/DropZone'

describe('DropZone Component', () => {
  it('does not render into the DOM when isDragging is false', () => {
    const { container } = render(<DropZone isDragging={false} />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/Drop files to upload them/i)).not.toBeInTheDocument()
  })

  it('renders drop overlay with prompt text when isDragging is true', () => {
    render(<DropZone isDragging={true} />)
    const promptElement = screen.getByText(/Drop files to upload them/i)
    expect(promptElement).toBeInTheDocument()
  })

  it('contains dashed border and backdrop overlay elements', () => {
    const { container } = render(<DropZone isDragging={true} />)
    const dashedOverlay = container.querySelector('.border-dashed')
    expect(dashedOverlay).toBeInTheDocument()
    expect(dashedOverlay).toHaveClass('border-blue-500')
  })
})
