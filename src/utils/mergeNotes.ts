import type { Note } from '../features/notes/types'

export const mergeNotesByNewest = (localNotes: Note[], remoteNotes: Note[]): Note[] => {
  const merged = new Map<string, Note>()

  for (const note of localNotes) {
    merged.set(note.id, note)
  }

  for (const note of remoteNotes) {
    const existing = merged.get(note.id)
    if (!existing || note.updatedAt >= existing.updatedAt) {
      merged.set(note.id, note)
    }
  }

  return [...merged.values()]
}
