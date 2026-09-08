import { UploadCloud } from 'lucide-react'
import './App.css'

function App() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shadow-xs">
        <h1 className="text-xl font-semibold text-slate-900">File Upload Manager</h1>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No files uploaded
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Click the <span className="font-semibold text-slate-700">Upload File</span> button above start adding files.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App




