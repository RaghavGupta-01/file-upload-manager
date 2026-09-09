import type { FileItem } from '../types/file'

export interface UploadProgressCallback {
  (progress: number, uploadedBytes: number): void
}

export interface UploadOptions {
  onProgress?: UploadProgressCallback
  onSuccess?: () => void
  onError?: (error: Error) => void
}

class UploadService {
  public async upload(fileItem: FileItem, options: UploadOptions = {}): Promise<void> {
    const { onProgress, onSuccess } = options

    const totalBytes = fileItem.size || 1024 * 1024
    let uploadedBytes = 0

    const totalChunks = Math.max(10, Math.min(50, Math.round(totalBytes / (50 * 1024))))
    const chunkBytes = Math.ceil(totalBytes / totalChunks)
    const intervalMs = Math.max(50, Math.min(150, Math.round(1500 / totalChunks)))

    return new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        uploadedBytes += chunkBytes
        if (uploadedBytes >= totalBytes) {
          uploadedBytes = totalBytes
          clearInterval(intervalId)
          onProgress?.(100, totalBytes)
          onSuccess?.()
          resolve()
        } else {
          const progress = Math.min(99, Math.round((uploadedBytes / totalBytes) * 100))
          onProgress?.(progress, uploadedBytes)
        }
      }, intervalMs)
    })
  }
}

export const uploadService = new UploadService()
