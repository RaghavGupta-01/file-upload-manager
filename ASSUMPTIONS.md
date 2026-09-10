# Assumptions

## 1. Storage & Backend
- Upload operations are simulated locally on the client using a mock service (`UploadService`) with asynchronous chunk delays.
- No real cloud backend (e.g., AWS S3, Firebase Storage, Supabase) is required for this frontend demonstration.
- The service architecture allows swapping the mock implementation with real cloud storage providers without changing UI components or queue management.

---

## 2. File Validation & Limits
- The maximum allowed file size is 20 MB per file.
- Supported file extensions include common document, image, spreadsheet, and archive formats (`png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `csv`, `txt`, `zip`).
- Files exceeding 20 MB or possessing unsupported extensions are rejected at ingestion and display error notifications without being added to the queue.

---

## 3. Duplicate Detection
- A file is considered a duplicate if both its `name` and exact `size` (in bytes) match an already uploaded file or another file in the same upload batch.
- Duplicate files are rejected with a warning notification to prevent accidental duplicate uploads.

---

## 4. Chunking & Concurrency
- Each file is divided into sequential 1 MB fixed binary chunks (`File.slice`).
- Concurrency limit is strictly enforced at the file level (maximum 3 files uploading simultaneously), while chunks within each file are uploaded sequentially.
- Progress updates are calculated dynamically based on transmitted chunk bytes.

---

## 5. Cancellation & Resume
- Cancellation stops the active upload process immediately via `AbortController` signals rather than merely hiding UI elements.
- On retry, files preserve their previous byte progress and resume from the next un-uploaded chunk rather than restarting from chunk 1.

---

## 6. Persistence
- Uploaded file metadata and statuses are persisted in browser IndexedDB (`file_upload_manager_db`) and automatically restored across page refreshes.
- Full binary chunk resumption operates during the active session where native in-memory `File` references remain available.
