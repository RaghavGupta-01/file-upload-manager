import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { FileItem } from '../types/file'
import { createFileItem } from '../utils/fileUtils'

export function useFileUpload() {
  const [files, setFiles] = useState<FileItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const selectedFiles = Array.from(e.target.files)
    const newItems = selectedFiles.map(createFileItem)

    setFiles((prev) => [...newItems, ...prev])
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const clearFiles = () => {
    setFiles([])
  }

  return {
    files,
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    removeFile,
    clearFiles,
  }
}
