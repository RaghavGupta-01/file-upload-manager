export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'canceled'

export interface FileItem {
  id: string
  name: string
  size: number
  type: string
  status: UploadStatus
  progress: number
  uploadedBytes?: number
  errorMessage?: string
  rawFile?: File
}
