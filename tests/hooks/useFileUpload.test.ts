import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileUpload } from '../../src/hooks/useFileUpload'
import { uploadService } from '../../src/services/uploadService'
import type { UploadOptions } from '../../src/services/uploadService'
import { storageService } from '../../src/services/storageService'

describe('useFileUpload hook - State Transitions & Operations', () => {
  const createMockFile = (name: string, size = 1024, type = 'text/plain'): File => {
    const blob = new Blob(['sample content'], { type })
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

  it('initializes with empty files array and restores storage', async () => {
    const { result } = renderHook(() => useFileUpload())

    expect(result.current.files).toEqual([])
    expect(result.current.rejectedFiles).toEqual([])

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isRestored).toBe(true)
    expect(storageService.getAllFiles).toHaveBeenCalled()
  })

  describe('State transitions', () => {
    it('transitions correctly: pending -> uploading -> completed', async () => {
      let capturedCallbacks: UploadOptions | undefined

      vi.spyOn(uploadService, 'upload').mockImplementation((_file, callbacks) => {
        capturedCallbacks = callbacks
        return new Promise(() => {})
      })

      const { result } = renderHook(() => useFileUpload())

      await act(async () => {
        await Promise.resolve()
      })

      const mockFile = createMockFile('document.pdf', 2048, 'application/pdf')

      act(() => {
        result.current.addFiles([mockFile])
      })

      // Initially added with status 'pending' / immediately picked up by queue to 'uploading'
      const fileId = result.current.files[0].id
      expect(result.current.files[0].status).toBe('uploading')
      expect(result.current.files[0].progress).toBe(0)
      expect(capturedCallbacks).toBeDefined()

      // Progress update during uploading
      act(() => {
        capturedCallbacks?.onProgress?.(50, 1024)
      })

      const uploadingFile = result.current.files.find((f) => f.id === fileId)
      expect(uploadingFile?.status).toBe('uploading')
      expect(uploadingFile?.progress).toBe(50)
      expect(uploadingFile?.uploadedBytes).toBe(1024)

      // Success callback transitions to completed
      act(() => {
        capturedCallbacks?.onSuccess?.()
      })

      const completedFile = result.current.files.find((f) => f.id === fileId)
      expect(completedFile?.status).toBe('completed')
      expect(completedFile?.progress).toBe(100)
    })

    it('transitions correctly: pending -> uploading -> failed -> retry -> uploading -> completed', async () => {
      let capturedCallbacks: UploadOptions | undefined
      let callCount = 0

      vi.spyOn(uploadService, 'upload').mockImplementation((_file, callbacks) => {
        callCount++
        capturedCallbacks = callbacks
        return new Promise(() => {})
      })

      const { result } = renderHook(() => useFileUpload())

      await act(async () => {
        await Promise.resolve()
      })

      const mockFile = createMockFile('retry-test.pdf', 2048, 'application/pdf')

      act(() => {
        result.current.addFiles([mockFile])
      })

      const fileId = result.current.files[0].id
      expect(result.current.files[0].status).toBe('uploading')
      expect(callCount).toBe(1)

      // Trigger upload failure
      act(() => {
        capturedCallbacks?.onError?.(new Error('Network connection lost'))
      })

      let currentFile = result.current.files.find((f) => f.id === fileId)
      expect(currentFile?.status).toBe('failed')
      expect(currentFile?.errorMessage).toBe('Network connection lost')

      // Trigger retry
      act(() => {
        result.current.retryUpload(fileId)
      })

      // Retry resets to pending, and queue automatically starts it to uploading
      currentFile = result.current.files.find((f) => f.id === fileId)
      expect(callCount).toBe(2)
      expect(currentFile?.status).toBe('uploading')
      expect(currentFile?.errorMessage).toBeUndefined()

      // Now complete successfully
      act(() => {
        capturedCallbacks?.onSuccess?.()
      })

      currentFile = result.current.files.find((f) => f.id === fileId)
      expect(currentFile?.status).toBe('completed')
      expect(currentFile?.progress).toBe(100)
    })

    it('transitions correctly: uploading -> cancel -> canceled', async () => {
      let capturedCallbacks: UploadOptions | undefined

      vi.spyOn(uploadService, 'upload').mockImplementation((_file, callbacks) => {
        capturedCallbacks = callbacks
        return new Promise(() => {})
      })

      vi.spyOn(uploadService, 'cancel').mockImplementation((_id) => {
        // When upload is canceled, uploadService aborts and triggers onError with canceled message
        capturedCallbacks?.onError?.(new Error('Upload canceled by user'))
      })

      const { result } = renderHook(() => useFileUpload())

      await act(async () => {
        await Promise.resolve()
      })

      const mockFile = createMockFile('cancel-test.pdf', 2048, 'application/pdf')

      act(() => {
        result.current.addFiles([mockFile])
      })

      const fileId = result.current.files[0].id
      expect(result.current.files[0].status).toBe('uploading')

      // User triggers cancel
      act(() => {
        result.current.cancelUpload(fileId)
      })

      const canceledFile = result.current.files.find((f) => f.id === fileId)
      expect(canceledFile?.status).toBe('canceled')
      expect(canceledFile?.errorMessage).toContain('canceled')
    })
  })

  describe('File operations', () => {
    it('removes a file and triggers cancel and storage delete', async () => {
      const cancelSpy = vi.spyOn(uploadService, 'cancel').mockImplementation(() => {})
      const { result } = renderHook(() => useFileUpload())

      await act(async () => {
        await Promise.resolve()
      })

      const file = createMockFile('test.pdf', 1024, 'application/pdf')

      act(() => {
        result.current.addFiles([file])
      })

      const fileId = result.current.files[0].id

      act(() => {
        result.current.removeFile(fileId)
      })

      expect(result.current.files).toHaveLength(0)
      expect(cancelSpy).toHaveBeenCalledWith(fileId)
      expect(storageService.deleteFile).toHaveBeenCalledWith(fileId)
    })

    it('clears all files and cancels active uploads', async () => {
      const cancelSpy = vi.spyOn(uploadService, 'cancel').mockImplementation(() => {})
      const { result } = renderHook(() => useFileUpload())

      await act(async () => {
        await Promise.resolve()
      })

      const file1 = createMockFile('file1.pdf', 1024, 'application/pdf')
      const file2 = createMockFile('file2.png', 1024, 'image/png')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      expect(result.current.files).toHaveLength(2)

      act(() => {
        result.current.clearFiles()
      })

      expect(result.current.files).toHaveLength(0)
      expect(cancelSpy).toHaveBeenCalledTimes(2)
      expect(storageService.clearAll).toHaveBeenCalled()
    })
  })
})
