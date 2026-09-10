import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { FileItem } from '../../src/components/FileItem'
import type { FileItem as FileItemType } from '../../src/types/file'
import * as fileUtils from '../../src/utils/fileUtils'

describe('FileItem Component', () => {
  const createMockFileItem = (overrides: Partial<FileItemType> = {}): FileItemType => ({
    id: 'test-file-1',
    name: 'document.pdf',
    size: 2.5 * 1024 * 1024,
    type: 'application/pdf',
    status: 'completed',
    progress: 100,
    uploadedBytes: 2.5 * 1024 * 1024,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders file name and formatted file size', () => {
    const file = createMockFileItem({ name: 'contract.pdf', size: 1024 * 1024 })
    render(<FileItem file={file} />)

    expect(screen.getByText('contract.pdf')).toBeInTheDocument()
    expect(screen.getByText('1 MB')).toBeInTheDocument()
  })

  it('displays progress bar and cancel button when status is uploading', () => {
    const onCancel = vi.fn()
    const file = createMockFileItem({ status: 'uploading', progress: 45 })
    render(<FileItem file={file} onCancel={onCancel} />)

    // Cancel button rendered
    const cancelButton = screen.getByTitle('Cancel upload')
    expect(cancelButton).toBeInTheDocument()

    // Clicking cancel invokes callback with file id
    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalledWith('test-file-1')
  })

  it('displays retry button when status is failed or canceled', () => {
    const onRetry = vi.fn()
    const failedFile = createMockFileItem({ status: 'failed', errorMessage: 'Network error' })
    const { rerender } = render(<FileItem file={failedFile} onRetry={onRetry} />)

    const retryButton = screen.getByTitle('Retry upload')
    expect(retryButton).toBeInTheDocument()

    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledWith('test-file-1')

    // Also verify for canceled status
    const canceledFile = createMockFileItem({ status: 'canceled' })
    rerender(<FileItem file={canceledFile} onRetry={onRetry} />)
    expect(screen.getByTitle('Retry upload')).toBeInTheDocument()
  })

  it('opens action dropdown and triggers delete callback', () => {
    const onDelete = vi.fn()
    const file = createMockFileItem()
    render(<FileItem file={file} onDelete={onDelete} />)

    // Open action menu
    const actionsButton = screen.getByLabelText('Actions')
    fireEvent.click(actionsButton)

    // Delete button visible in dropdown
    const deleteButton = screen.getByText('Delete file')
    expect(deleteButton).toBeInTheDocument()

    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith('test-file-1')
  })

  it('triggers download utility when Download option is clicked', () => {
    const downloadSpy = vi.spyOn(fileUtils, 'downloadFile').mockImplementation(() => {})
    const file = createMockFileItem()
    render(<FileItem file={file} />)

    // Open menu and click Download
    fireEvent.click(screen.getByLabelText('Actions'))
    const downloadButton = screen.getByText('Download')
    fireEvent.click(downloadButton)

    expect(downloadSpy).toHaveBeenCalledWith(file)
  })
})
