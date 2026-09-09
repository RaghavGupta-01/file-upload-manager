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
  private activeUploads: Map<string, { abort: () => void }> = new Map()

  public async upload(fileItem: FileItem, options: UploadOptions = {}): Promise<void> {
    const { onProgress, onSuccess, onError } = options

    if (this.activeUploads.has(fileItem.id)) {
      this.cancel(fileItem.id)
    }

    const totalBytes = fileItem.size || 1024 * 1024
    let uploadedBytes = 0

    const totalChunks = Math.max(10, Math.min(50, Math.round(totalBytes / (50 * 1024))))
    const chunkBytes = Math.ceil(totalBytes / totalChunks)
    const intervalMs = Math.max(50, Math.min(150, Math.round(1500 / totalChunks)))

    return new Promise<void>((resolve, reject) => {
      let isAborted = false

      const intervalId = setInterval(() => {
        if (isAborted) return

        uploadedBytes += chunkBytes
        if (uploadedBytes >= totalBytes) {
          uploadedBytes = totalBytes
          clearInterval(intervalId)
          this.activeUploads.delete(fileItem.id)
          onProgress?.(100, totalBytes)
          onSuccess?.()
          resolve()
        } else {
          const progress = Math.min(99, Math.round((uploadedBytes / totalBytes) * 100))
          onProgress?.(progress, uploadedBytes)
        }
      }, intervalMs)

      this.activeUploads.set(fileItem.id, {
        abort: () => {
          isAborted = true
          clearInterval(intervalId)
          this.activeUploads.delete(fileItem.id)
          const cancelError = new Error('Upload canceled')
          onError?.(cancelError)
          reject(cancelError)
        },
      })
    })
  }

  public cancel(fileId: string): void {
    const task = this.activeUploads.get(fileId)
    if (task) {
      task.abort()
    }
  }

  public isUploading(fileId: string): boolean {
    return this.activeUploads.has(fileId)
  }
}

export const uploadService = new UploadService()
