import { useFileUpload } from './hooks/useFileUpload'
import { Header } from './components/Header'
import { FileList } from './components/FileList'
import { EmptyState } from './components/EmptyState'
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
      <Header onUploadClick={triggerFileInput} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        {files.length > 0 ? (
          <FileList files={files} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

export default App
