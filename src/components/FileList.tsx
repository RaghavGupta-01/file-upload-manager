import React from 'react'
import type { FileItem as FileItemType } from '../types/file'
import { FileItem } from './FileItem'

interface FileListProps {
  files: FileItemType[]
  onActionClick?: (file: FileItemType) => void
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onActionClick,
  onCancel,
  onRetry,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-2.5">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onActionClick={onActionClick}
          onCancel={onCancel}
          onRetry={onRetry}
        />
      ))}
    </div>
  )
}