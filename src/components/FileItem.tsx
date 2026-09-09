import React, { useState, useRef, useEffect } from 'react'
import type { FileItem as FileItemType } from '../types/file'
import { formatFileSize, downloadFile } from '../utils/fileUtils'
import { FileIcon } from './FileIcon'
import { FileStatusBadge } from './FileStatusBadge'
import { ProgressBar } from './ProgressBar'
import { MoreVertical, X, RotateCcw, Trash2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItemProps {
  file: FileItemType
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onDelete?: (id: string) => void
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  onCancel,
  onRetry,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isProgressVisible = file.status === 'uploading' || file.status === 'pending'
  const isUploading = file.status === 'uploading'
  const canRetry = file.status === 'failed' || file.status === 'canceled'

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleDownload = () => {
    setIsMenuOpen(false)
    downloadFile(file)
    toast.success(`Downloaded ${file.name}`, { id: `download-${file.id}` })
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete?.(file.id)
  }

  return (
    <div className="w-full bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-2 relative">
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

          {/* More Actions Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isMenuOpen
                  ? 'bg-slate-100 text-slate-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download</span>
                </button>

                {onDelete && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete file</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isProgressVisible && <ProgressBar progress={file.progress} />}
    </div>
  )
}
