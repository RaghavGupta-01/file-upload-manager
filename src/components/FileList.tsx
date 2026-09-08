import React from 'react'
import type { FileItem } from '../types/file'
import { formatFileSize } from '../utils/fileUtils'
import { File, FileText, Image, MoreVertical } from 'lucide-react'

interface FileListProps {
  files: FileItem[]
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />
    } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <FileText className="w-5 h-5 text-indigo-500" />
    }
    return <File className="w-5 h-5 text-slate-500" />
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="w-full bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-slate-50 rounded-md border border-slate-100 shrink-0">
              {getFileIcon(file.type)}
            </div>
            <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-slate-400 shrink-0">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}