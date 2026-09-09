import type { FileItem } from '../types/file'

export interface UploadProgressCallback {
  (progress: number, uploadedBytes: number): void
}

export interface UploadOptions {
  onProgress?: UploadProgressCallback
  onSuccess?: () => void
  onError?: (error: Error) => void
}

const CHUNK_SIZE = 1 * 1024 * 1024 // 1 MB fixed chunk size
const SIMULATED_CHUNK_LATENCY_MS = 250 // Simulated network latency per chunk

class UploadService {
  private activeUploads: Map<string, AbortController> = new Map()

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('Upload canceled'))
        return
      }

      const timer = setTimeout(() => {
        resolve()
      }, ms)

      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(new Error('Upload canceled'))
        },
        { once: true }
      )
    })
  }

  public async upload(fileItem: FileItem, options: UploadOptions = {}): Promise<void> {
    const { onProgress, onSuccess, onError } = options

    if (this.activeUploads.has(fileItem.id)) {
      this.cancel(fileItem.id)
    }

    const abortController = new AbortController()
    this.activeUploads.set(fileItem.id, abortController)

    const totalBytes = fileItem.size || 1024 * 1024
    const totalChunks = Math.max(1, Math.ceil(totalBytes / CHUNK_SIZE))
    let uploadedBytes = 0

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (abortController.signal.aborted) {
          throw new Error('Upload canceled')
        }

        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, totalBytes)

        if (fileItem.rawFile) {
          fileItem.rawFile.slice(start, end)
        }

        await this.delay(SIMULATED_CHUNK_LATENCY_MS, abortController.signal)

        uploadedBytes = end
        const progress = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100))
        onProgress?.(progress, uploadedBytes)
      }

      this.activeUploads.delete(fileItem.id)
      onProgress?.(100, totalBytes)
      onSuccess?.()
    } catch (error) {
      this.activeUploads.delete(fileItem.id)
      const err = error instanceof Error ? error : new Error('Upload failed')
      onError?.(err)
    }
  }

  public cancel(fileId: string): void {
    const controller = this.activeUploads.get(fileId)
    if (controller) {
      controller.abort()
      this.activeUploads.delete(fileId)
    }
  }

  public isUploading(fileId: string): boolean {
    return this.activeUploads.has(fileId)
  }
}

export const uploadService = new UploadService()
