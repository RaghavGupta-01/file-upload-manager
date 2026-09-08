import React from 'react'

interface ProgressBarProps {
  progress: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = 'h-1.5' }) => {
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
