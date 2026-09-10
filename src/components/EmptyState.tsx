import { UploadCloud } from 'lucide-react'

export const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center text-center max-w-md p-8">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          No files uploaded
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Drag & drop files anywhere on the screen, or click the{' '}
          <span className="font-semibold text-blue-600">Upload File</span> button above to start adding files.
        </p>
      </div>
    </div>
  )
}
