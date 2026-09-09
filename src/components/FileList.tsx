import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { FileItem as FileItemType } from '../types/file'
import { FileItem } from './FileItem'
import { ArrowUpDown, Check } from 'lucide-react'

type SortKey = 'name-asc' | 'name-desc' | null

interface FileListProps {
  files: FileItemType[]
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onDelete?: (id: string) => void
}

const SORT_OPTIONS: { id: 'name-asc' | 'name-desc'; label: string }[] = [
  { id: 'name-asc', label: 'File Name (A to Z)' },
  { id: 'name-desc', label: 'File Name (Z to A)' },
]

export const FileList: React.FC<FileListProps> = ({
  files,
  onCancel,
  onRetry,
  onDelete,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSortMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSortMenuOpen])

  const sortedFiles = useMemo(() => {
    if (!sortKey) return files

    return [...files].sort((a, b) => {
      if (sortKey === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      }
      if (sortKey === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
      }
      return 0
    })
  }, [files, sortKey])

  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-2.5">
      <div className="px-4 py-3 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">

        <div className="flex-1 min-w-0">
          <span>File Name</span>
        </div>

        <div className="w-28 shrink-0 text-slate-400">
          <span>File Size</span>
        </div>

        <div className="w-44 shrink-0 flex items-center justify-end">
          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setIsSortMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${sortKey
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-white shadow-2xs'
                }`}
              title="Sort files"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sort By
                </div>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSortKey(option.id)
                      setIsSortMenuOpen(false)
                    }}
                    className={`w-full px-3 py-1.5 text-xs flex items-center justify-between transition-colors text-left cursor-pointer ${sortKey === option.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span>{option.label}</span>
                    {sortKey === option.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {sortedFiles.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onCancel={onCancel}
            onRetry={onRetry}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}