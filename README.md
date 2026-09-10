# File Upload Manager

A File Upload Manager built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Vitest**.

It provides a multi-file upload management system featuring drag-and-drop ingestion, sequential chunk slicing, a max-3 concurrency queue, immediate cancellation via `AbortController`, resume from failed chunks, and persistent state hydration with IndexedDB.

---

## Features

- **Multi-File Selection & Drag-and-Drop**: Native HTML5 Drag & Drop with active viewport overlay styling, file picker integration, and keyboard accessibility.
- **Queue Management & Concurrency Control**:
  - Enforces a strict maximum of 3 concurrent active uploads (`MAX_CONCURRENT_UPLOADS = 3`).
  - Automatically enqueues additional files as `pending` (Queued).
  - Autonomous slot dispatching: promotes and starts the next pending file whenever an active upload completes, cancels, or fails.
- **Chunked Upload Simulation**:
  - Slices files into fixed 1 MB binary chunks using `File.slice(start, end)`.
  - Sequential chunk transmission with simulated network latency for observable, byte-accurate progress tracking.
- **Cancellation & Failure Handling**:
  - Real-time upload abortion using native `AbortController` signals to immediately terminate active delays and chunk processing.
  - Granular error capturing with user-friendly toast notifications.
- **Resume Failed Uploads**:
  - Preserves uploaded byte progress on failure.
  - On retry, resumes upload from the exact next un-uploaded chunk rather than restarting from chunk 1.
- **File Validation & Duplicate Prevention**:
  - 20 MB file size limit with human-readable error messages.
  - Allowed file formats: PNG, JPG, JPEG, GIF, WEBP, SVG, PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, ZIP.
  - Duplicate detection by exact `name + size` within the queue and across incoming batches.
- **Offline Persistence & Auto-Hydration**:
  - Native zero-dependency IndexedDB storage (`file_upload_manager_db`) automatically restores uploaded file metadata and statuses across page refreshes.
- **Real-Time Search & Sorting**:
  - Search files in real time by name with instant clear button.
  - Sort file list ascending or descending by file name.

---

## Architecture & State Flow

The application enforces a strict separation of concerns between presentation components, state orchestration hooks, and upload services:

```text
                    ┌─────────────────────────┐
                    │  DropZone / FilePicker  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      FileList UI        │
                    │ (FileItem / StatusBadge)│
                    └────────────┬────────────┘
                                 │
                                 ▼
                  ┌─────────────────────────────┐
                  │        useFileUpload        │
                  │                             │
                  │  • Queue (Max 3 Concurrency)│
                  │  • Validation & Duplicates  │
                  │  • Retry & Resume           │
                  │  • AbortController Cancel   │
                  │  • IndexedDB Auto-Sync      │
                  └──────────────┬──────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      uploadService      │
                    │                         │
                    │  • Fixed 1MB Chunks     │
                    │  • Binary File.slice()  │
                    │  • Simulated Latency    │
                    │  • Chunk Resume Support │
                    └─────────────────────────┘
```

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Notifications**: React Hot Toast
- **Persistence**: Browser IndexedDB API
- **Testing**: Vitest + React Testing Library + JSDOM
- **Linter**: Oxlint

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
# Run all test suites
npm test

# Run tests in watch mode
npm run test:watch
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run Linter
```bash
npm run lint
```

---

## Automated Test Coverage

The test suite is located under the root `tests/` directory and covers all core state transitions, queue limits, validation rules, chunk operations, and UI component interactions:

| Test Suite | File Location | Covered Behaviors |
| :--- | :--- | :--- |
| **Hook & Lifecycle** | `tests/hooks/useFileUpload.test.ts` | State transitions (`pending` → `uploading` → `completed`, failure retry, cancel abort, storage hydration). |
| **File Validation** | `tests/utils/fileValidation.test.ts` | Size limit (>20MB), unsupported formats (.exe, .sh), duplicate checks, batch partitioning. |
| **Concurrency Queue** | `tests/hooks/concurrency.test.ts` | Max 3 active upload limit, auto-starting next queued file on complete/cancel/failure. |
| **Chunking & Resume** | `tests/services/uploadService.test.ts` | 1MB slicing, sequential chunk updates, timer cancellation, resume from specific chunk index. |
| **UI Components** | `tests/components/DropZone.test.tsx`<br>`tests/components/FileItem.test.tsx` | Drag overlay rendering/unmounting, progress bar rendering, retry/cancel events, download and delete menu actions. |

---

## Project Structure

```text
file-upload-manager/
├── src/
│   ├── components/
│   │   ├── AppToaster.tsx          # Toast notification provider
│   │   ├── DropZone.tsx            # Drag-and-drop viewport overlay
│   │   ├── EmptyState.tsx          # Empty state illustration and upload prompt
│   │   ├── FileItem.tsx            # File row with size, progress, status, and dropdown menu
│   │   ├── FileList.tsx            # File table header, search bar, and sort selector
│   │   ├── FileStatusBadge.tsx     # Status pill badge (Uploading, Queued, Failed, Cancelled)
│   │   └── Header.tsx              # Application header bar with Upload button
│   ├── hooks/
│   │   ├── useDragAndDrop.ts       # Drag events and drop zone state management
│   │   └── useFileUpload.ts        # Queue management, concurrency (max 3), retry, and storage sync
│   ├── services/
│   │   ├── storageService.ts       # IndexedDB storage provider for file persistence
│   │   └── uploadService.ts        # Chunked upload engine with AbortController and resume support
│   ├── types/
│   │   └── file.ts                 # FileItem and UploadStatus TypeScript definitions
│   ├── utils/
│   │   ├── fileUtils.ts            # File formatting, size calculation, and download helper
│   │   └── fileValidation.ts       # 20MB limit, extension validation, and duplicate detection
│   ├── App.tsx                     # Main dashboard orchestrator
│   ├── index.css                   # Global styles and Tailwind v4 theme
│   └── main.tsx                    # Application root mount
├── tests/
│   ├── components/
│   │   ├── DropZone.test.tsx       # Drag-and-drop overlay rendering & styling tests
│   │   └── FileItem.test.tsx       # File row, status badges, and action dropdown tests
│   ├── hooks/
│   │   ├── concurrency.test.ts     # Max 3 concurrency queue tests
│   │   └── useFileUpload.test.ts   # useFileUpload lifecycle & state transition tests
│   ├── services/
│   │   └── uploadService.test.ts   # Chunk slicing, progress, cancel, and resume tests
│   ├── utils/
│   │   └── fileValidation.test.ts  # File size, format, and duplicate validation tests
│   └── setup.ts                    # Vitest and React Testing Library setup
├── README.md
├── package.json
└── vite.config.ts
```
