import React from 'react'
import { UploadCloud } from 'lucide-react'

interface HeaderProps {
  onUploadClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick }) => {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shadow-xs sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-900">File Upload Manager</h1>
      <button
        type="button"
        onClick={onUploadClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
      >
        <UploadCloud className="w-4 h-4" />
        <span>Upload File</span>
      </button>
    </header>
  )
}
