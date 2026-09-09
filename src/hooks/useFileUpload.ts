import { useState, useRef, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import type { FileItem } from '../types/file'
import { createFileItem } from '../utils/fileUtils'
import { validateFiles } from '../utils/fileValidation'
import type { ValidationOptions, RejectedFile } from '../utils/fileValidation'
import { uploadService } from '../services/uploadService'

export function useFileUpload(options?: ValidationOptions) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const startUpload = useCallback((item: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f))
    )

    uploadService
      .upload(item, {
        onProgress: (progress, uploadedBytes) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: 'uploading', progress, uploadedBytes }
                : f
            )
          )
        },
        onSuccess: () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          )
        },
        onError: (error) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'failed',
                    errorMessage: error.message,
                  }
                : f
            )
          )
        },
      })
      .catch(() => {
      })
  }, [])

  const addFiles = (incomingFiles: File[]) => {
    const { validFiles, rejectedFiles: newRejected } = validateFiles(
      incomingFiles,
      files,
      options
    )

    if (newRejected.length > 0) {
      setRejectedFiles((prev) => [...newRejected, ...prev])
      newRejected.forEach((item) => {
        const isDuplicate = item.reason.toLowerCase().includes('duplicate')

        if (isDuplicate) {
          toast(`${item.file.name}: ${item.reason}`, {
            icon: '⚠️',
            id: `duplicate-${item.file.name}-${item.file.size}`,
          })
        } else {
          toast.error(`${item.file.name}: ${item.reason}`, {
            id: `rejected-${item.file.name}-${item.file.size}`,
          })
        }
      })
    }

    if (validFiles.length > 0) {
      const newItems: FileItem[] = validFiles.map((file) => ({
        ...createFileItem(file),
        status: 'uploading',
      }))

      setFiles((prev) => [...newItems, ...prev])

      newItems.forEach((item) => {
        startUpload(item)
      })
    }

    return { validFiles, rejectedFiles: newRejected }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const clearFiles = () => {
    setFiles([])
  }

  const clearRejectedFiles = () => {
    setRejectedFiles([])
  }

  return {
    files,
    rejectedFiles,
    fileInputRef,
    triggerFileInput,
    addFiles,
    handleFileChange,
    removeFile,
    clearFiles,
    clearRejectedFiles,
  }
}
