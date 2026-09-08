import { UploadCloud } from 'lucide-react'
import { useFileUpload } from './hooks/useFileUpload'
import { FileList } from './components/FileList'
import './App.css'

function App() {
  const { files, fileInputRef, triggerFileInput, handleFileChange } = useFileUpload()

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shadow-xs sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-slate-900">File Upload Manager</h1>
        <button
          onClick={triggerFileInput}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        {files.length > 0 ? (
          <FileList files={files} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center justify-center text-center max-w-md p-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No files uploaded
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Click the <span className="font-semibold text-blue-600">Upload File</span> button above to start adding files.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
