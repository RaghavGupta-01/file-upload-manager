import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uploadService } from '../../src/services/uploadService'
import type { FileItem } from '../../src/types/file'

describe('UploadService - Chunking & Sequential Slicing', () => {
  const createMockFileItem = (id: string, name: string, sizeBytes: number): { item: FileItem; sliceSpy: ReturnType<typeof vi.fn> } => {
    const sliceSpy = vi.fn((start: number, end: number) => {
      const blob = new Blob(['x'.repeat(Math.max(0, end - start))])
      return blob
    })

    const rawFile = {
      name,
      size: sizeBytes,
      type: 'application/octet-stream',
      slice: sliceSpy,
    } as unknown as File

    const item: FileItem = {
      id,
      name,
      size: sizeBytes,
      type: 'application/octet-stream',
      status: 'pending',
      progress: 0,
      uploadedBytes: 0,
      rawFile,
    }

    return { item, sliceSpy }
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uploads a file < 1MB in a single 1-chunk slice', async () => {
    const fileSize = 500 * 1024 // 500 KB
    const { item, sliceSpy } = createMockFileItem('file-small', 'small.pdf', fileSize)

    const onProgress = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const uploadPromise = uploadService.upload(item, {
      onProgress,
      onSuccess,
      onError,
    })

    expect(uploadService.isUploading('file-small')).toBe(true)

    // Advance through the chunk delay
    await vi.advanceTimersByTimeAsync(300)
    await uploadPromise

    expect(sliceSpy).toHaveBeenCalledTimes(1)
    expect(sliceSpy).toHaveBeenCalledWith(0, fileSize)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
    expect(onProgress).toHaveBeenLastCalledWith(100, fileSize)
    expect(uploadService.isUploading('file-small')).toBe(false)
  })

  it('slices a 2.5MB file into 3 sequential 1MB chunks and updates byte progress', async () => {
    const CHUNK_SIZE = 1 * 1024 * 1024 // 1MB
    const fileSize = 2.5 * 1024 * 1024 // 2.5MB
    const { item, sliceSpy } = createMockFileItem('file-multi', 'large.zip', fileSize)

    const progressUpdates: Array<{ progress: number; uploadedBytes: number }> = []
    const onProgress = vi.fn((progress: number, uploadedBytes: number) => {
      progressUpdates.push({ progress, uploadedBytes })
    })
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const uploadPromise = uploadService.upload(item, {
      onProgress,
      onSuccess,
      onError,
    })

    // Advance timers chunk by chunk
    // Chunk 1: 0 to 1MB
    await vi.advanceTimersByTimeAsync(260)
    expect(sliceSpy).toHaveBeenCalledWith(0, CHUNK_SIZE)

    // Chunk 2: 1MB to 2MB
    await vi.advanceTimersByTimeAsync(260)
    expect(sliceSpy).toHaveBeenCalledWith(CHUNK_SIZE, 2 * CHUNK_SIZE)

    // Chunk 3: 2MB to 2.5MB
    await vi.advanceTimersByTimeAsync(260)
    expect(sliceSpy).toHaveBeenCalledWith(2 * CHUNK_SIZE, fileSize)

    await uploadPromise

    expect(sliceSpy).toHaveBeenCalledTimes(3)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()

    // Verify progress milestones
    expect(progressUpdates.length).toBeGreaterThanOrEqual(3)
    const finalUpdate = progressUpdates[progressUpdates.length - 1]
    expect(finalUpdate.progress).toBe(100)
    expect(finalUpdate.uploadedBytes).toBe(fileSize)
  })

  it('aborts upload immediately when cancel() is called during chunk processing', async () => {
    const fileSize = 5 * 1024 * 1024 // 5MB (5 chunks)
    const { item } = createMockFileItem('file-abort', 'video.mp4', fileSize)

    const onProgress = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const uploadPromise = uploadService.upload(item, {
      onProgress,
      onSuccess,
      onError,
    })

    // Advance 1 chunk
    await vi.advanceTimersByTimeAsync(260)
    expect(uploadService.isUploading('file-abort')).toBe(true)

    // Cancel mid-upload on chunk 2
    uploadService.cancel('file-abort')

    await vi.advanceTimersByTimeAsync(300)
    await uploadPromise

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0].message).toContain('Upload canceled')
    expect(uploadService.isUploading('file-abort')).toBe(false)
  })

  it('cancels any prior active upload if the same file id is re-uploaded', async () => {
    const fileSize = 2 * 1024 * 1024 // 2MB
    const { item } = createMockFileItem('file-dup', 'file.doc', fileSize)

    const firstOnError = vi.fn()
    const secondOnSuccess = vi.fn()

    // Start first upload
    uploadService.upload(item, {
      onError: firstOnError,
    })

    // Start second upload with same ID before first finishes
    const secondUploadPromise = uploadService.upload(item, {
      onSuccess: secondOnSuccess,
    })

    await Promise.resolve()

    expect(firstOnError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Upload canceled' }))

    await vi.advanceTimersByTimeAsync(1000)
    await secondUploadPromise

    expect(secondOnSuccess).toHaveBeenCalledTimes(1)
  })

  it('resumes upload from a specific chunk when startChunk / uploadedBytes is provided', async () => {
    const CHUNK_SIZE = 1 * 1024 * 1024 // 1MB
    const fileSize = 4 * 1024 * 1024 // 4MB (4 chunks)
    const { item, sliceSpy } = createMockFileItem('file-resume', 'archive.tar', fileSize)

    // Simulate item already uploaded 2 chunks (2MB)
    item.uploadedBytes = 2 * CHUNK_SIZE
    item.progress = 50

    const onProgress = vi.fn()
    const onSuccess = vi.fn()

    const uploadPromise = uploadService.upload(item, {
      onProgress,
      onSuccess,
    })

    // Advance chunk 3 (2MB to 3MB)
    await vi.advanceTimersByTimeAsync(260)
    expect(sliceSpy).toHaveBeenCalledWith(2 * CHUNK_SIZE, 3 * CHUNK_SIZE)

    // Advance chunk 4 (3MB to 4MB)
    await vi.advanceTimersByTimeAsync(260)
    expect(sliceSpy).toHaveBeenCalledWith(3 * CHUNK_SIZE, 4 * CHUNK_SIZE)

    await uploadPromise

    // Total slices should only be 2 (chunks 3 and 4, not chunks 1 and 2)
    expect(sliceSpy).toHaveBeenCalledTimes(2)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onProgress).toHaveBeenLastCalledWith(100, fileSize)
  })
})
