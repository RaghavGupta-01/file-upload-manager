import React from 'react'
import { ArrowUp, Cloud } from 'lucide-react'

interface DropZoneProps {
  isDragging: boolean
}

export const DropZone: React.FC<DropZoneProps> = ({ isDragging }) => {
  if (!isDragging) return null

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-end pb-16 animate-in fade-in duration-200">
      <div className="absolute inset-3 md:inset-5 border-2 border-dashed border-blue-500 bg-blue-500/5 rounded-3xl backdrop-blur-[1px] transition-all" />
      <div className="relative z-10 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center text-blue-600">
          <Cloud className="w-16 h-16 fill-blue-600 text-blue-600 drop-shadow-md" />
          <ArrowUp className="w-6 h-6 text-white absolute top-[22px] stroke-[3]" />
        </div>
        <div className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-500/25 border border-blue-400/30 font-medium text-sm sm:text-base">
          <span>Drop files to upload them</span>
        </div>
      </div>
    </div>
  )
}
