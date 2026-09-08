import type { FileItem } from '../types/file'
import { formatFileSize, getFileExtension } from './fileUtils'

export const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export const DEFAULT_ALLOWED_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
  'txt',
  'zip',
]

export interface ValidationOptions {
  maxSizeBytes?: number
  allowedExtensions?: string[]
  checkDuplicates?: boolean
}

export interface RejectedFile {
  file: File
  reason: string
}

export interface ValidationBatchResult {
  validFiles: File[]
  rejectedFiles: RejectedFile[]
}

export function isAllowedFileType(file: File, allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS): boolean {
  if (allowedExtensions.length === 0) return true
  const ext = getFileExtension(file.name)
  return allowedExtensions.includes(ext.toLowerCase())
}

export function isDuplicateFile(file: File, existingFiles: FileItem[]): boolean {
  return existingFiles.some(
    (existing) => existing.name === file.name && existing.size === file.size
  )
}

export function validateFile(
  file: File,
  existingFiles: FileItem[] = [],
  options: ValidationOptions = {}
): { isValid: boolean; error?: string } {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE
  const allowedExtensions = options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS
  const checkDuplicates = options.checkDuplicates ?? true

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds the ${formatFileSize(maxSizeBytes)} limit`,
    }
  }

  if (!isAllowedFileType(file, allowedExtensions)) {
    return {
      isValid: false,
      error: `File format (.${getFileExtension(file.name) || 'unknown'}) is not supported`,
    }
  }

  if (checkDuplicates && isDuplicateFile(file, existingFiles)) {
    return {
      isValid: false,
      error: 'File with the same name and size is already uploaded',
    }
  }

  return { isValid: true }
}

export function validateFiles(
  incomingFiles: File[],
  existingFiles: FileItem[] = [],
  options: ValidationOptions = {}
): ValidationBatchResult {
  const validFiles: File[] = []
  const rejectedFiles: RejectedFile[] = []

  incomingFiles.forEach((file) => {

    const isDuplicateInBatch = validFiles.some(
      (existing) => existing.name === file.name && existing.size === file.size
    )

    if (isDuplicateInBatch) {
      rejectedFiles.push({
        file,
        reason: 'Duplicate file in the same upload batch',
      })
      return
    }

    const result = validateFile(file, existingFiles, options)

    if (result.isValid) {
      validFiles.push(file)
    } else {
      rejectedFiles.push({
        file,
        reason: result.error || 'Invalid file',
      })
    }
  })

  return { validFiles, rejectedFiles }
}
