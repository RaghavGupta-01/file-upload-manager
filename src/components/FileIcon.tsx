import React from 'react'
import { File, FileText, Image } from 'lucide-react'

interface FileIconProps {
  type: string
  className?: string
}

export const FileIcon: React.FC<FileIconProps> = ({ type, className = 'w-5 h-5' }) => {
  if (type.startsWith('image/')) {
    return <Image className={`${className} text-blue-500`} />
  }

  if (
    type.includes('pdf') ||
    type.includes('document') ||
    type.includes('text') ||
    type.includes('msword') ||
    type.includes('officedocument')
  ) {
    return <FileText className={`${className} text-indigo-500`} />
  }

  return <File className={`${className} text-slate-500`} />
}
