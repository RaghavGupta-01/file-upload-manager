import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import type { FileItem } from '../types/file'
import { createFileItem } from '../utils/fileUtils'
import { validateFiles } from '../utils/fileValidation'
import type { ValidationOptions, RejectedFile } from '../utils/fileValidation'
import { uploadService } from '../services/uploadService'
import { storageService } from '../services/storageService'

const MAX_CONCURRENT_UPLOADS = 3

export function useFileUpload(options?: ValidationOptions) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([])
  const [isRestored, setIsRestored] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    storageService.getAllFiles().then((storedFiles) => {
      if (isMounted) {
        if (storedFiles.length > 0) {
          setFiles(storedFiles)
        }
        setIsRestored(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isRestored) {
      storageService.saveFiles(files)
    }
  }, [files, isRestored])

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
          const isAborted = error.message.includes('canceled')
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: isAborted ? 'canceled' : 'failed',
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

  // Process concurrent upload queue
  useEffect(() => {
    if (!isRestored) return

    const activeUploads = files.filter((f) => f.status === 'uploading').length
    const availableSlots = MAX_CONCURRENT_UPLOADS - activeUploads

    if (availableSlots > 0) {
      const pendingFiles = files.filter((f) => f.status === 'pending')
      const filesToStart = pendingFiles.slice(0, availableSlots)

      filesToStart.forEach((file) => {
        startUpload(file)
      })
    }
  }, [files, isRestored, startUpload])

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
        status: 'pending',
      }))

      setFiles((prev) => [...newItems, ...prev])
    }

    return { validFiles, rejectedFiles: newRejected }
  }

  const cancelUpload = (id: string) => {
    uploadService.cancel(id)
  }

  const retryUpload = (id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: 'pending', progress: 0, errorMessage: undefined }
          : f
      )
    )
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    uploadService.cancel(id)
    const target = files.find((f) => f.id === id)
    setFiles((prev) => prev.filter((file) => file.id !== id))
    storageService.deleteFile(id)
    if (target) {
      toast.success(`${target.name} deleted`, { id: `delete-${id}` })
    }
  }

  const clearFiles = () => {
    files.forEach((file) => uploadService.cancel(file.id))
    setFiles([])
    storageService.clearAll()
  }

  const clearRejectedFiles = () => {
    setRejectedFiles([])
  }

  return {
    files,
    rejectedFiles,
    isRestored,
    fileInputRef,
    triggerFileInput,
    addFiles,
    handleFileChange,
    removeFile,
    clearFiles,
    clearRejectedFiles,
    cancelUpload,
    retryUpload,
  }
}
