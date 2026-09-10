import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileUpload } from '../../src/hooks/useFileUpload'
import { uploadService } from '../../src/services/uploadService'
import type { UploadOptions } from '../../src/services/uploadService'
import { storageService } from '../../src/services/storageService'

describe('Upload Concurrency Queue (Max 3)', () => {
  const createMockFile = (name: string, size = 1024, type = 'text/plain'): File => {
    const blob = new Blob(['content'], { type })
    const file = new File([blob], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(storageService, 'getAllFiles').mockResolvedValue([])
    vi.spyOn(storageService, 'saveFiles').mockResolvedValue()
    vi.spyOn(storageService, 'deleteFile').mockResolvedValue()
    vi.spyOn(storageService, 'clearAll').mockResolvedValue()
  })

  it('limits active uploads to exactly 3 when adding 5 files', async () => {
    const activeUploadMap = new Map<string, UploadOptions>()

    vi.spyOn(uploadService, 'upload').mockImplementation((fileItem, options) => {
      activeUploadMap.set(fileItem.id, options ?? {})
      return new Promise(() => {}) // keep unresolved
    })

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      await Promise.resolve()
    })

    const files = [
      createMockFile('file1.pdf'),
      createMockFile('file2.pdf'),
      createMockFile('file3.pdf'),
      createMockFile('file4.pdf'),
      createMockFile('file5.pdf'),
    ]

    act(() => {
      result.current.addFiles(files)
    })

    const uploadingFiles = result.current.files.filter((f) => f.status === 'uploading')
    const pendingFiles = result.current.files.filter((f) => f.status === 'pending')

    expect(uploadingFiles).toHaveLength(3)
    expect(pendingFiles).toHaveLength(2)
    expect(uploadService.upload).toHaveBeenCalledTimes(3)
  })

  it('starts the next pending file when an active upload completes', async () => {
    const activeUploadMap = new Map<string, UploadOptions>()

    vi.spyOn(uploadService, 'upload').mockImplementation((fileItem, options) => {
      activeUploadMap.set(fileItem.id, options ?? {})
      return new Promise(() => {})
    })

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      await Promise.resolve()
    })

    const files = [
      createMockFile('file1.pdf'),
      createMockFile('file2.pdf'),
      createMockFile('file3.pdf'),
      createMockFile('file4.pdf'),
    ]

    act(() => {
      result.current.addFiles(files)
    })

    const initiallyUploading = result.current.files.filter((f) => f.status === 'uploading')
    expect(initiallyUploading).toHaveLength(3)
    expect(result.current.files.filter((f) => f.status === 'pending')).toHaveLength(1)

    // Complete the first active upload
    const firstFileId = initiallyUploading[0].id
    act(() => {
      activeUploadMap.get(firstFileId)?.onSuccess?.()
    })

    // Now 1 completed, 3 uploading (including the previously queued file4)
    expect(result.current.files.find((f) => f.id === firstFileId)?.status).toBe('completed')
    expect(result.current.files.filter((f) => f.status === 'uploading')).toHaveLength(3)
    expect(result.current.files.filter((f) => f.status === 'pending')).toHaveLength(0)
    expect(uploadService.upload).toHaveBeenCalledTimes(4)
  })

  it('starts the next pending file when an active upload is canceled', async () => {
    const activeUploadMap = new Map<string, UploadOptions>()

    vi.spyOn(uploadService, 'upload').mockImplementation((fileItem, options) => {
      activeUploadMap.set(fileItem.id, options ?? {})
      return new Promise(() => {})
    })

    vi.spyOn(uploadService, 'cancel').mockImplementation((id) => {
      activeUploadMap.get(id)?.onError?.(new Error('Upload canceled'))
    })

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      await Promise.resolve()
    })

    const files = [
      createMockFile('file1.pdf'),
      createMockFile('file2.pdf'),
      createMockFile('file3.pdf'),
      createMockFile('file4.pdf'),
    ]

    act(() => {
      result.current.addFiles(files)
    })

    const uploadingFiles = result.current.files.filter((f) => f.status === 'uploading')
    const fileToCancel = uploadingFiles[0].id

    act(() => {
      result.current.cancelUpload(fileToCancel)
    })

    expect(result.current.files.find((f) => f.id === fileToCancel)?.status).toBe('canceled')
    expect(result.current.files.filter((f) => f.status === 'uploading')).toHaveLength(3)
    expect(result.current.files.filter((f) => f.status === 'pending')).toHaveLength(0)
  })

  it('starts the next pending file when an active upload fails', async () => {
    const activeUploadMap = new Map<string, UploadOptions>()

    vi.spyOn(uploadService, 'upload').mockImplementation((fileItem, options) => {
      activeUploadMap.set(fileItem.id, options ?? {})
      return new Promise(() => {})
    })

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      await Promise.resolve()
    })

    const files = [
      createMockFile('file1.pdf'),
      createMockFile('file2.pdf'),
      createMockFile('file3.pdf'),
      createMockFile('file4.pdf'),
    ]

    act(() => {
      result.current.addFiles(files)
    })

    const uploadingFiles = result.current.files.filter((f) => f.status === 'uploading')
    const fileToFail = uploadingFiles[1].id

    act(() => {
      activeUploadMap.get(fileToFail)?.onError?.(new Error('Network error'))
    })

    expect(result.current.files.find((f) => f.id === fileToFail)?.status).toBe('failed')
    expect(result.current.files.filter((f) => f.status === 'uploading')).toHaveLength(3)
    expect(result.current.files.filter((f) => f.status === 'pending')).toHaveLength(0)
  })
})
