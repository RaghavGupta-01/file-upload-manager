import React from 'react'
import type { UploadStatus } from '../types/file'
import { AlertCircle, Clock, Loader2, XCircle } from 'lucide-react'

interface FileStatusBadgeProps {
  status: UploadStatus
  progress?: number
  errorMessage?: string
}

export const FileStatusBadge: React.FC<FileStatusBadgeProps> = ({
  status,
  progress = 0,
  errorMessage,
}) => {
  switch (status) {
    case 'uploading':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 shrink-0">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{progress}%</span>
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
      return null
    case 'failed':
      return (
        <span
          className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60 shrink-0"
          title={errorMessage}
        >
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
