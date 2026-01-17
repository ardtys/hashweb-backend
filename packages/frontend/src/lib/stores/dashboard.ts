import { writable, derived } from 'svelte/store'
import type { StoredNote } from '$lib/services/noteStorage'

export interface DashboardFilters {
  search: string
  type: 'all' | 'text' | 'file'
  status: 'all' | 'active' | 'expired'
  sortBy: 'createdAt' | 'expiresAt' | 'type'
  sortOrder: 'asc' | 'desc'
}

export interface DashboardState {
  notes: StoredNote[]
  filters: DashboardFilters
  selectedNoteId: string | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  notes: [],
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedNoteId: null,
  loading: false,
  error: null,
}

export const dashboardStore = writable<DashboardState>(initialState)

/**
 * Derived store: Filtered and sorted notes based on current filters
 */
export const filteredNotes = derived(dashboardStore, $store => {
  const now = Math.floor(Date.now() / 1000)
  let notes = $store.notes

  // Apply search filter
  if ($store.filters.search) {
    const searchLower = $store.filters.search.toLowerCase()
    notes = notes.filter(
      note =>
        note.id.toLowerCase().includes(searchLower) ||
        note.label?.toLowerCase().includes(searchLower)
    )
  }

  // Apply type filter
  if ($store.filters.type !== 'all') {
    notes = notes.filter(note => note.type === $store.filters.type)
  }

  // Apply status filter
  if ($store.filters.status !== 'all') {
    notes = notes.filter(note => {
      const isExpired =
        (note.expiresAt && note.expiresAt < now) ||
        (note.viewsRemaining !== undefined && note.viewsRemaining <= 0)

      if ($store.filters.status === 'active') {
        return !isExpired && !note.unavailable
      } else if ($store.filters.status === 'expired') {
        return isExpired || note.unavailable
      }
      return true
    })
  }

  // Apply sorting
  notes = [...notes].sort((a, b) => {
    let comparison = 0

    switch ($store.filters.sortBy) {
      case 'createdAt':
        comparison = a.createdAt - b.createdAt
        break
      case 'expiresAt':
        const aExpires = a.expiresAt || Infinity
        const bExpires = b.expiresAt || Infinity
        comparison = aExpires - bExpires
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
    }

    return $store.filters.sortOrder === 'asc' ? comparison : -comparison
  })

  return notes
})

/**
 * Derived store: Dashboard statistics
 */
export const dashboardStats = derived(dashboardStore, $store => {
  const now = Math.floor(Date.now() / 1000)

  const total = $store.notes.length
  const active = $store.notes.filter(note => {
    if (note.unavailable) return false
    if (note.expiresAt && note.expiresAt < now) return false
    if (note.viewsRemaining !== undefined && note.viewsRemaining <= 0) return false
    return true
  }).length

  const expired = $store.notes.filter(note => {
    if (note.expiresAt && note.expiresAt < now) return true
    if (note.viewsRemaining !== undefined && note.viewsRemaining <= 0) return true
    return false
  }).length

  const unavailable = $store.notes.filter(note => note.unavailable).length

  const totalViewsRemaining = $store.notes.reduce((sum, note) => {
    return sum + (note.viewsRemaining || 0)
  }, 0)

  const oldestNote = $store.notes.length > 0
    ? Math.min(...$store.notes.map(n => n.createdAt))
    : null

  const textNotes = $store.notes.filter(n => n.type === 'text').length
  const fileNotes = $store.notes.filter(n => n.type === 'file').length

  return {
    total,
    active,
    expired,
    unavailable,
    totalViewsRemaining,
    oldestNote,
    textNotes,
    fileNotes,
  }
})

/**
 * Update notes in the store
 */
export function setNotes(notes: StoredNote[]) {
  dashboardStore.update(state => ({ ...state, notes }))
}

/**
 * Update a single note
 */
export function updateNote(id: string, updates: Partial<StoredNote>) {
  dashboardStore.update(state => ({
    ...state,
    notes: state.notes.map(note => (note.id === id ? { ...note, ...updates } : note)),
  }))
}

/**
 * Remove a note from the store
 */
export function removeNote(id: string) {
  dashboardStore.update(state => ({
    ...state,
    notes: state.notes.filter(note => note.id !== id),
  }))
}

/**
 * Update filters
 */
export function updateFilters(filters: Partial<DashboardFilters>) {
  dashboardStore.update(state => ({
    ...state,
    filters: { ...state.filters, ...filters },
  }))
}

/**
 * Set loading state
 */
export function setLoading(loading: boolean) {
  dashboardStore.update(state => ({ ...state, loading }))
}

/**
 * Set error message
 */
export function setError(error: string | null) {
  dashboardStore.update(state => ({ ...state, error }))
}

/**
 * Select a note
 */
export function selectNote(id: string | null) {
  dashboardStore.update(state => ({ ...state, selectedNoteId: id }))
}

/**
 * Reset dashboard to initial state
 */
export function resetDashboard() {
  dashboardStore.set(initialState)
}
