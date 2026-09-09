import React from 'react'
import type { FileItem as FileItemType } from '../types/file'
import { FileItem } from './FileItem'

interface FileListProps {
  files: FileItemType[]
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onDelete?: (id: string) => void
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onCancel,
  onRetry,
  onDelete,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-2.5">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onCancel={onCancel}
          onRetry={onRetry}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}