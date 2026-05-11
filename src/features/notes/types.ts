export type NoteId = string

export interface Note {
  id: NoteId
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
  zIndex: number
  updatedAt: number
}

export type InteractionMode = 'drag' | 'resize' | null

export interface InteractionState {
  noteId: NoteId | null
  mode: InteractionMode
  pointerOffsetX: number
  pointerOffsetY: number
  startWidth: number
  startHeight: number
  startPointerX: number
  startPointerY: number
  overTrash: boolean
}

export interface NotesState {
  notes: Note[]
  nextZIndex: number
  interaction: InteractionState
  syncStatus: 'idle' | 'saving' | 'saved' | 'error'
}

export interface BoardRect {
  width: number
  height: number
}

export interface NoteDraft {
  x: number
  y: number
  width: number
  height: number
  color: string
}
