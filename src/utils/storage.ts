import type { Note } from '../features/notes/types'
import { NOTE_COLORS, NOTE_LIMITS, STORAGE_KEY } from './constants'

const VALID_COLORS = new Set<string>(NOTE_COLORS)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isValidNote = (value: unknown): value is Note => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<Note>

  return (
    typeof candidate.id === 'string' &&
    isFiniteNumber(candidate.x) &&
    isFiniteNumber(candidate.y) &&
    isFiniteNumber(candidate.width) &&
    candidate.width >= NOTE_LIMITS.minWidth &&
    candidate.width <= NOTE_LIMITS.maxWidth &&
    isFiniteNumber(candidate.height) &&
    candidate.height >= NOTE_LIMITS.minHeight &&
    candidate.height <= NOTE_LIMITS.maxHeight &&
    typeof candidate.text === 'string' &&
    typeof candidate.color === 'string' &&
    VALID_COLORS.has(candidate.color) &&
    isFiniteNumber(candidate.zIndex) &&
    isFiniteNumber(candidate.updatedAt)
  )
}

export const loadNotesFromStorage = (): Note[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) {
      return []
    }

    return data.filter(isValidNote)
  } catch {
    return []
  }
}

export const saveNotesToStorage = (notes: Note[]): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

