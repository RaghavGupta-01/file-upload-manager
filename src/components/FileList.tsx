import React from 'react'
import type { FileItem } from '../types/file'
import { formatFileSize } from '../utils/fileUtils'
import {
  File,
  FileText,
  Image,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react'

interface FileListProps {
  files: FileItem[]
  onActionClick?: (file: FileItem) => void
}

export const FileList: React.FC<FileListProps> = ({ files, onActionClick }) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />
    } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <FileText className="w-5 h-5 text-indigo-500" />
    }
    return <File className="w-5 h-5 text-slate-500" />
  }

  const renderStatus = (file: FileItem) => {
    switch (file.status) {
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 shrink-0">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{file.progress}%</span>
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Queued</span>
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60 shrink-0" title={file.errorMessage}>
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>Failed</span>
          </span>
        )
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>Canceled</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-2.5">
      {files.map((file) => (
        <div
          key={file.id}
          className="w-full bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon & File Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-slate-50 rounded-md border border-slate-100 shrink-0">
                {getFileIcon(file.type)}
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
            <div className="flex items-center gap-3 shrink-0">
              {renderStatus(file)}

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

          {/* Upload Progress Bar (shown when uploading or pending) */}
          {(file.status === 'uploading' || file.status === 'pending') && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}