import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { FileItem } from '../types/file'
import { createFileItem } from '../utils/fileUtils'
import { validateFiles } from '../utils/fileValidation'
import type { ValidationOptions, RejectedFile } from '../utils/fileValidation'

export function useFileUpload(options?: ValidationOptions) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addFiles = (incomingFiles: File[]) => {
    const { validFiles, rejectedFiles: newRejected } = validateFiles(
      incomingFiles,
      files,
      options
    )

    if (newRejected.length > 0) {
      setRejectedFiles((prev) => [...newRejected, ...prev])
    }

    if (validFiles.length > 0) {
      const newItems = validFiles.map(createFileItem)
      setFiles((prev) => [...newItems, ...prev])
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
