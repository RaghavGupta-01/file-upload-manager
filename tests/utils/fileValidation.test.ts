import { describe, it, expect } from 'vitest'
import {
  isAllowedFileType,
  isDuplicateFile,
  validateFile,
  validateFiles,
  DEFAULT_MAX_FILE_SIZE,
} from '../../src/utils/fileValidation'
import type { FileItem } from '../../src/types/file'

describe('fileValidation utility', () => {
  const createMockFile = (name: string, size = 1024, type = 'text/plain'): File => {
    const blob = new Blob(['content'], { type })
    const file = new File([blob], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  const createMockFileItem = (id: string, name: string, size = 1024): FileItem => ({
    id,
    name,
    size,
    type: 'text/plain',
    status: 'completed',
    progress: 100,
    uploadedBytes: size,
  })

  describe('isAllowedFileType', () => {
    it('accepts valid extensions regardless of case', () => {
      const fileLower = createMockFile('document.pdf')
      const fileUpper = createMockFile('IMAGE.PNG')
      expect(isAllowedFileType(fileLower)).toBe(true)
      expect(isAllowedFileType(fileUpper)).toBe(true)
    })

    it('rejects disallowed extensions', () => {
      const fileExe = createMockFile('installer.exe')
      const fileSh = createMockFile('script.sh')
      expect(isAllowedFileType(fileExe)).toBe(false)
      expect(isAllowedFileType(fileSh)).toBe(false)
    })

    it('handles custom allowed extensions list', () => {
      const filePng = createMockFile('photo.png')
      const filePdf = createMockFile('doc.pdf')
      expect(isAllowedFileType(filePng, ['png'])).toBe(true)
      expect(isAllowedFileType(filePdf, ['png'])).toBe(false)
    })
  })

  describe('isDuplicateFile', () => {
    it('returns true if a file with same name and size exists', () => {
      const incoming = createMockFile('resume.pdf', 5000)
      const existing = [createMockFileItem('1', 'resume.pdf', 5000)]
      expect(isDuplicateFile(incoming, existing)).toBe(true)
    })

    it('returns false if name differs or size differs', () => {
      const incoming1 = createMockFile('resume_new.pdf', 5000)
      const incoming2 = createMockFile('resume.pdf', 6000)
      const existing = [createMockFileItem('1', 'resume.pdf', 5000)]
      expect(isDuplicateFile(incoming1, existing)).toBe(false)
      expect(isDuplicateFile(incoming2, existing)).toBe(false)
    })
  })

  describe('validateFile', () => {
    it('validates a valid file successfully', () => {
      const file = createMockFile('test.pdf', 1024 * 1024)
      const result = validateFile(file)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects file exceeding size limit', () => {
      const oversizedFile = createMockFile('huge.pdf', DEFAULT_MAX_FILE_SIZE + 1)
      const result = validateFile(oversizedFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File size exceeds the 20 MB limit')
    })

    it('rejects file with unsupported format', () => {
      const file = createMockFile('program.exe', 1024)
      const result = validateFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File format (.exe) is not supported')
    })

    it('rejects duplicate file when checkDuplicates is true', () => {
      const file = createMockFile('existing.pdf', 2048)
      const existing = [createMockFileItem('1', 'existing.pdf', 2048)]
      const result = validateFile(file, existing, { checkDuplicates: true })
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('File with the same name and size is already uploaded')
    })

    it('allows duplicate file if checkDuplicates is false', () => {
      const file = createMockFile('existing.pdf', 2048)
      const existing = [createMockFileItem('1', 'existing.pdf', 2048)]
      const result = validateFile(file, existing, { checkDuplicates: false })
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateFiles (batch)', () => {
    it('partitions incoming files into valid and rejected', () => {
      const file1 = createMockFile('good.pdf', 1024)
      const file2 = createMockFile('bad.exe', 1024)
      const file3 = createMockFile('huge.png', 25 * 1024 * 1024)

      const result = validateFiles([file1, file2, file3])
      expect(result.validFiles).toHaveLength(1)
      expect(result.validFiles[0].name).toBe('good.pdf')

      expect(result.rejectedFiles).toHaveLength(2)
      expect(result.rejectedFiles[0].file.name).toBe('bad.exe')
      expect(result.rejectedFiles[0].reason).toContain('.exe')
      expect(result.rejectedFiles[1].file.name).toBe('huge.png')
      expect(result.rejectedFiles[1].reason).toContain('File size exceeds')
    })

    it('detects duplicate files in the same batch', () => {
      const file1 = createMockFile('duplicate.pdf', 2048)
      const file2 = createMockFile('duplicate.pdf', 2048)

      const result = validateFiles([file1, file2])
      expect(result.validFiles).toHaveLength(1)
      expect(result.validFiles[0].name).toBe('duplicate.pdf')

      expect(result.rejectedFiles).toHaveLength(1)
      expect(result.rejectedFiles[0].file.name).toBe('duplicate.pdf')
      expect(result.rejectedFiles[0].reason).toBe('Duplicate file in the same upload batch')
    })
  })
})
