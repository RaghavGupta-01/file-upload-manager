import React from 'react'
import type { FileItem as FileItemType } from '../types/file'
import { formatFileSize } from '../utils/fileUtils'
import { FileIcon } from './FileIcon'
import { FileStatusBadge } from './FileStatusBadge'
import { ProgressBar } from './ProgressBar'
import { MoreVertical, X, RotateCcw } from 'lucide-react'

interface FileItemProps {
  file: FileItemType
  onActionClick?: (file: FileItemType) => void
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  onActionClick,
  onCancel,
  onRetry,
}) => {
  const isProgressVisible = file.status === 'uploading' || file.status === 'pending'
  const isUploading = file.status === 'uploading'
  const canRetry = file.status === 'failed' || file.status === 'canceled'

  return (
    <div className="w-full bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon & File Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-slate-50 rounded-md border border-slate-100 shrink-0">
            <FileIcon type={file.type} />
          </div>
          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm font-medium text-slate-800 truncate" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-slate-400 shrink-0">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>

        {/* Right: Status Badge & Action Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <FileStatusBadge
            status={file.status}
            progress={file.progress}
            errorMessage={file.errorMessage}
          />

          {isUploading && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(file.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Cancel upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {canRetry && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(file.id)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Retry upload"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onActionClick?.(file)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isProgressVisible && <ProgressBar progress={file.progress} />}
    </div>
  )
}
