import { AppToaster } from './components/AppToaster'
import { useFileUpload } from './hooks/useFileUpload'
import { useDragAndDrop } from './hooks/useDragAndDrop'
import { Header } from './components/Header'
import { FileList } from './components/FileList'
import { EmptyState } from './components/EmptyState'
import { DropZone } from './components/DropZone'
import './App.css'

function App() {
  const {
    files,
    fileInputRef,
    triggerFileInput,
    addFiles,
    handleFileChange,
    cancelUpload,
    retryUpload,
    removeFile,
  } = useFileUpload()
  const { isDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
    onDropFiles: addFiles,
  })

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full min-h-screen bg-slate-50 flex flex-col relative"
    >
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

      {/* Toast Notifications */}
      <AppToaster />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start relative">
        {files.length > 0 ? (
          <FileList
            files={files}
            onCancel={cancelUpload}
            onRetry={retryUpload}
            onDelete={removeFile}
          />
        ) : (
          <EmptyState />
        )}

        {/* DropZone Overlay */}
        <DropZone isDragging={isDragging} />
      </main>
    </div>
  )
}

export default App
