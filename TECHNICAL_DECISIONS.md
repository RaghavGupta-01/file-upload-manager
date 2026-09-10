# Technical Decisions

## 1. Upload Service Abstraction
- **Decision**: Created a strict `UploadService` interface decoupling upload orchestration from the storage backend.
- **Reason**: Decoupling the UI and queue manager from upload transport guarantees that `uploadService` can be swapped with cloud providers (e.g., AWS S3 multipart upload, Firebase Storage, or Supabase Storage) without modifying UI components, validation, or queue management hooks.

---

## 2. Fixed-Size Chunking with Binary Slicing
- **Decision**: Implemented sequential 1 MB binary chunking using `File.slice(start, end)`.
- **Reason**: Slicing files into fixed chunks allows accurate byte-level progress reporting and provides fine-grained recovery boundaries. Uploading chunks sequentially with observable latency prevents instantaneous jumps (0% → 100%) and mirrors real-world multipart upload behavior.

---

## 3. Concurrency Queue Architecture (Max 3 Active Uploads)
- **Decision**: Implemented a reactive sliding-window queue enforcing a strict limit of 3 concurrent uploads.
- **Reason**: Unconstrained simultaneous uploads degrade network throughput and saturate browser connection pools. A centralized concurrency manager queues additional files as `pending` and automatically dispatches available slots whenever an upload completes, fails, or cancels.

---

## 4. True Async Cancellation via `AbortController`
- **Decision**: Used native `AbortController` instances associated with each active upload ID.
- **Reason**: Prevents "fake" cancellation where UI state is updated while background promises continue executing. The `AbortSignal` is checked before each chunk and cancels active timer delays immediately, freeing network and compute resources.

---

## 5. Chunk-Level Resume on Retry
- **Decision**: On retry, files calculate the resume boundary rather than restarting from chunk 1.
- **Reason**: Resuming from the last successfully uploaded chunk saves bandwidth and reduces retry latency, fulfilling production multipart upload standards.

---

## 6. Persistence & Hydration with IndexedDB
- **Decision**: Used native browser IndexedDB (`file_upload_manager_db`) over `localStorage`.
- **Reason**: `localStorage` has a synchronous blocking API with a strict 5 MB quota limit across all keys and cannot store large structured metadata or binary blobs. IndexedDB provides asynchronous, non-blocking storage with generous storage quotas and seamless auto-hydration across page refreshes.

---

## 7. Client-Side Validation & Duplicate Detection
- **Decision**: Partitioned incoming files at the ingestion layer using `validateFiles()` before creating queue items.
- **Reason**: Validates 20 MB size limits, unsupported extensions, and batch-level duplicate files (`name + size`) upfront. Rejected files display dedicated toast notifications while valid files enter the queue without silent drops.

---

## 8. Separation of Concerns & Modular Architecture
- **Decision**: Enforced strict architectural boundaries:
  - **Presentation Layer**: Pure UI components (`Header`, `FileList`, `FileItem`, `FileStatusBadge`, `DropZone`, `EmptyState`).
  - **State Orchestration**: Custom hooks (`useFileUpload`, `useDragAndDrop`).
  - **Service Layer**: Zero-dependency standalone services (`uploadService`, `storageService`).
  - **Utility Layer**: Pure deterministic helper functions (`fileValidation`, `fileUtils`).
- **Reason**: Keeps components focused on rendering, simplifies testability, and prevents state bloat in the main `App.tsx` component.

---

## 9. Dedicated Testing Architecture
- **Decision**: Placed all automated test suites in a root-level `tests/` directory categorized by module (`tests/hooks/`, `tests/utils/`, `tests/services/`, `tests/components/`).
- **Reason**: Separating test code from application source code maintains clean production builds while organizing unit and integration tests cleanly with Vitest, React Testing Library, and JSDOM.
