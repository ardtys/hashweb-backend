import { API } from 'hashweb/shared'

export interface StoredNote {
  id: string
  password?: string // Hex encoded encryption key
  createdAt: number // Unix timestamp (seconds)
  expiresAt?: number // Unix timestamp (seconds) - for time-based expiry
  viewsRemaining?: number // For view-based expiry
  type: 'text' | 'file'
  url: string // Full shareable URL
  label?: string // Optional user-defined label
  unavailable?: boolean // Note was deleted/expired on server
}

interface NotesStore {
  notes: StoredNote[]
  version: number
}

export class NoteStorageService {
  private static readonly STORAGE_KEY = 'ghostfile_notes'
  private static readonly MAX_NOTES = 100
  private static readonly CURRENT_VERSION = 1

  /**
   * Get all notes from localStorage
   */
  static getAllNotes(): StoredNote[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []

      const store: NotesStore = JSON.parse(data)

      // Handle version migrations if needed
      if (store.version !== this.CURRENT_VERSION) {
        return this.migrateStore(store)
      }

      return store.notes || []
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error)
      return []
    }
  }

  /**
   * Save notes to localStorage
   */
  private static saveNotes(notes: StoredNote[]): void {
    try {
      const store: NotesStore = {
        notes,
        version: this.CURRENT_VERSION,
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store))

      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent('ghostfile-notes-changed', { detail: notes }))
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error)
      throw error
    }
  }

  /**
   * Add a new note
   */
  static addNote(note: StoredNote): void {
    const notes = this.getAllNotes()

    // Check if note already exists
    const existingIndex = notes.findIndex(n => n.id === note.id)
    if (existingIndex !== -1) {
      // Update existing note
      notes[existingIndex] = note
    } else {
      // Add new note at the beginning
      notes.unshift(note)
    }

    // Enforce max notes limit
    if (notes.length > this.MAX_NOTES) {
      notes.splice(this.MAX_NOTES)
    }

    this.saveNotes(notes)
  }

  /**
   * Get a single note by ID
   */
  static getNote(id: string): StoredNote | null {
    const notes = this.getAllNotes()
    return notes.find(n => n.id === id) || null
  }

  /**
   * Update a note
   */
  static updateNote(id: string, updates: Partial<StoredNote>): void {
    const notes = this.getAllNotes()
    const index = notes.findIndex(n => n.id === id)

    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates }
      this.saveNotes(notes)
    }
  }

  /**
   * Remove a single note
   */
  static removeNote(id: string): void {
    const notes = this.getAllNotes().filter(n => n.id !== id)
    this.saveNotes(notes)
  }

  /**
   * Remove multiple notes
   */
  static removeNotes(ids: string[]): void {
    const idsSet = new Set(ids)
    const notes = this.getAllNotes().filter(n => !idsSet.has(n.id))
    this.saveNotes(notes)
  }

  /**
   * Clean up expired notes
   */
  static cleanupExpired(): void {
    const now = Math.floor(Date.now() / 1000)
    const notes = this.getAllNotes()

    const activeNotes = notes.filter(note => {
      // Remove if time-based and expired
      if (note.expiresAt && note.expiresAt < now) {
        return false
      }

      // Remove if view-based and no views remaining
      if (note.viewsRemaining !== undefined && note.viewsRemaining <= 0) {
        return false
      }

      return true
    })

    if (activeNotes.length !== notes.length) {
      this.saveNotes(activeNotes)
    }
  }

  /**
   * Verify if a note still exists on the server
   */
  static async verifyNoteExists(id: string): Promise<boolean> {
    try {
      await API.preview(id)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Sync all notes with server to check availability
   */
  static async syncWithServer(): Promise<void> {
    const notes = this.getAllNotes()
    let needsUpdate = false

    for (const note of notes) {
      const exists = await this.verifyNoteExists(note.id)
      if (!exists && !note.unavailable) {
        note.unavailable = true
        needsUpdate = true
      } else if (exists && note.unavailable) {
        note.unavailable = false
        needsUpdate = true
      }
    }

    if (needsUpdate) {
      this.saveNotes(notes)
    }
  }

  /**
   * Export notes as JSON string
   */
  static exportNotes(): string {
    const notes = this.getAllNotes()
    return JSON.stringify(notes, null, 2)
  }

  /**
   * Import notes from JSON string
   */
  static importNotes(data: string): void {
    try {
      const importedNotes: StoredNote[] = JSON.parse(data)

      if (!Array.isArray(importedNotes)) {
        throw new Error('Invalid notes data')
      }

      const existingNotes = this.getAllNotes()
      const existingIds = new Set(existingNotes.map(n => n.id))

      // Only add notes that don't already exist
      const newNotes = importedNotes.filter(n => !existingIds.has(n.id))

      const combinedNotes = [...existingNotes, ...newNotes]

      // Enforce max limit
      if (combinedNotes.length > this.MAX_NOTES) {
        combinedNotes.splice(this.MAX_NOTES)
      }

      this.saveNotes(combinedNotes)
    } catch (error) {
      console.error('Failed to import notes:', error)
      throw new Error('Invalid notes format')
    }
  }

  /**
   * Clear all notes
   */
  static clearAll(): void {
    this.saveNotes([])
  }

  /**
   * Get stats about stored notes
   */
  static getStats(): {
    total: number
    active: number
    expired: number
    unavailable: number
  } {
    const now = Math.floor(Date.now() / 1000)
    const notes = this.getAllNotes()

    return {
      total: notes.length,
      active: notes.filter(n => {
        if (n.unavailable) return false
        if (n.expiresAt && n.expiresAt < now) return false
        if (n.viewsRemaining !== undefined && n.viewsRemaining <= 0) return false
        return true
      }).length,
      expired: notes.filter(n => {
        if (n.expiresAt && n.expiresAt < now) return true
        if (n.viewsRemaining !== undefined && n.viewsRemaining <= 0) return true
        return false
      }).length,
      unavailable: notes.filter(n => n.unavailable).length,
    }
  }

  /**
   * Migrate store from old version to new version
   */
  private static migrateStore(store: NotesStore): StoredNote[] {
    // Future migrations can be handled here
    // For now, just return notes as-is
    return store.notes || []
  }
}
