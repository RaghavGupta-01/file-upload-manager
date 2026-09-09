import type { FileItem } from '../types/file'

const DB_NAME = 'file_upload_manager_db'
const STORE_NAME = 'files'
const DB_VERSION = 1

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
          reject(new Error('IndexedDB is not supported in this environment'))
          return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          }
        }

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(request.error || new Error('Failed to open IndexedDB'))
        }
      })
    }
    return this.dbPromise
  }

  public async getAllFiles(): Promise<FileItem[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const rawItems = request.result as FileItem[]

          const restoredItems: FileItem[] = rawItems.map((item) => {
            if (item.status === 'uploading' || item.status === 'pending') {
              return {
                ...item,
                status: 'canceled',
                errorMessage: 'Upload interrupted',
              }
            }
            return item
          })
          resolve(restoredItems)
        }

        request.onerror = () => {
          reject(request.error || new Error('Failed to load files from storage'))
        }
      })
    } catch (error) {
      console.error('StorageService getAllFiles error:', error)
      return []
    }
  }

  public async saveFiles(files: FileItem[]): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        store.clear()
        for (const file of files) {
          const { rawFile: _rawFile, ...persistableFile } = file
          store.put(persistableFile)
        }

        tx.oncomplete = () => {
          resolve()
        }

        tx.onerror = () => {
          reject(tx.error || new Error('Failed to save files to storage'))
        }
      })
    } catch (error) {
      console.error('StorageService saveFiles error:', error)
    }
  }

  public async deleteFile(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error || new Error('Failed to delete file'))
      })
    } catch (error) {
      console.error('StorageService deleteFile error:', error)
    }
  }

  public async clearAll(): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error || new Error('Failed to clear storage'))
      })
    } catch (error) {
      console.error('StorageService clearAll error:', error)
    }
  }
}

export const storageService = new StorageService()
