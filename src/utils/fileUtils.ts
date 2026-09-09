import type { FileItem } from '../types/file'

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function createFileItem(file: File): FileItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    status: 'pending',
    progress: 0,
    uploadedBytes: 0,
    rawFile: file,
  }
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : ''
}

export function downloadFile(file: FileItem): void {
  let url: string
  let shouldRevoke = false

  if (file.rawFile) {
    url = URL.createObjectURL(file.rawFile)
    shouldRevoke = true
  } else {
    const fallbackBlob = new Blob([`Simulated content for ${file.name}`], {
      type: file.type || 'text/plain',
    })
    url = URL.createObjectURL(fallbackBlob)
    shouldRevoke = true
  }

  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  if (shouldRevoke) {
    URL.revokeObjectURL(url)
  }
}
