import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { FileItem as FileItemType } from '../types/file'
import { FileItem } from './FileItem'
import { ArrowUpDown, Check, Search, X } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
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


  const filteredFiles = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase()
    if (!trimmed) return files
    return files.filter((file) => file.name.toLowerCase().includes(trimmed))
  }, [files, searchQuery])


  const displayedFiles = useMemo(() => {
    if (!sortKey) return filteredFiles

    return [...filteredFiles].sort((a, b) => {
      if (sortKey === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      }
      if (sortKey === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
      }
      return 0
    })
  }, [filteredFiles, sortKey])

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col gap-3 sm:gap-4">
      {/* Search & Sort Controls Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name..."
            className="w-full bg-white pl-10 pr-9 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="relative shrink-0" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setIsSortMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              sortKey
                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-white shadow-2xs'
            }`}
            title="Sort files"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort</span>
          </button>

          {isSortMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 sm:w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
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
                  className={`w-full px-3 py-1.5 text-xs flex items-center justify-between transition-colors text-left cursor-pointer ${
                    sortKey === option.id
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

      {/* Table Header (Desktop / Tablet) */}
      <div className="hidden sm:flex px-4 py-2 items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
        <div className="flex-1 min-w-0">
          <span>File Name</span>
        </div>

        <div className="w-24 md:w-28 shrink-0 text-slate-400">
          <span>File Size</span>
        </div>

        <div className="w-36 md:w-44 shrink-0 text-right pr-2">
          <span></span>
        </div>
      </div>

      {/* File List Items / Empty Search State */}
      {displayedFiles.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {displayedFiles.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onCancel={onCancel}
              onRetry={onRetry}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
          <Search className="w-6 h-6 text-slate-300" />
          <span>No files found matching &quot;{searchQuery}&quot;</span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer mt-1"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}