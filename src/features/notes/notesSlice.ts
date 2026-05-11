import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { BoardRect, InteractionState, Note, NoteDraft, NoteId, NotesState } from './types'
import { clamp, clampNoteHeight, clampNotePosition, clampNoteWidth } from '../../utils/geometry'
import { BOARD_PADDING, NOTE_COLORS } from '../../utils/constants'

const createDefaultInteraction = (): InteractionState => ({
  noteId: null,
  mode: null,
  pointerOffsetX: 0,
  pointerOffsetY: 0,
  startWidth: 0,
  startHeight: 0,
  startPointerX: 0,
  startPointerY: 0,
  overTrash: false,
})

const initialState: NotesState = {
  notes: [],
  nextZIndex: 1,
  interaction: createDefaultInteraction(),
  syncStatus: 'idle',
}

const findNote = (state: NotesState, noteId: NoteId): Note | undefined =>
  state.notes.find((note) => note.id === noteId)

const setNoteUpdatedAt = (note: Note): void => {
  note.updatedAt = Date.now()
}

const getSafeColor = (color: string): string => {
  if (NOTE_COLORS.includes(color as (typeof NOTE_COLORS)[number])) {
    return color
  }

  return NOTE_COLORS[0]
}

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes(state, action: PayloadAction<Note[]>) {
      state.notes = action.payload
      state.nextZIndex = Math.max(1, ...action.payload.map((note) => note.zIndex + 1))
    },
    addNote(state, action: PayloadAction<NoteDraft>) {
      const { x, y, width, height, color } = action.payload
      state.notes.push({
        id: nanoid(),
        x,
        y,
        width: clampNoteWidth(width),
        height: clampNoteHeight(height),
        text: '',
        color: getSafeColor(color),
        zIndex: state.nextZIndex++,
        updatedAt: Date.now(),
      })
    },
    removeNote(state, action: PayloadAction<{ noteId: NoteId }>) {
      state.notes = state.notes.filter((note) => note.id !== action.payload.noteId)
      state.interaction = createDefaultInteraction()
    },
    bringToFront(state, action: PayloadAction<{ noteId: NoteId }>) {
      const note = findNote(state, action.payload.noteId)
      if (!note) {
        return
      }

      note.zIndex = state.nextZIndex++
      setNoteUpdatedAt(note)
    },
    updateNoteText(state, action: PayloadAction<{ noteId: NoteId; text: string }>) {
      const note = findNote(state, action.payload.noteId)
      if (!note) {
        return
      }

      note.text = action.payload.text
      setNoteUpdatedAt(note)
    },
    updateNoteColor(state, action: PayloadAction<{ noteId: NoteId; color: string }>) {
      const note = findNote(state, action.payload.noteId)
      if (!note) {
        return
      }

      note.color = getSafeColor(action.payload.color)
      setNoteUpdatedAt(note)
    },
    beginDrag(
      state,
      action: PayloadAction<{ noteId: NoteId; pointerX: number; pointerY: number }>,
    ) {
      const note = findNote(state, action.payload.noteId)
      if (!note) {
        return
      }

      state.interaction = {
        noteId: note.id,
        mode: 'drag',
        pointerOffsetX: action.payload.pointerX - note.x,
        pointerOffsetY: action.payload.pointerY - note.y,
        startWidth: note.width,
        startHeight: note.height,
        startPointerX: action.payload.pointerX,
        startPointerY: action.payload.pointerY,
        overTrash: false,
      }
    },
    updateDragPosition(
      state,
      action: PayloadAction<{ pointerX: number; pointerY: number; boardRect: BoardRect }>,
    ) {
      const { interaction } = state
      if (interaction.mode !== 'drag' || !interaction.noteId) {
        return
      }

      const note = findNote(state, interaction.noteId)
      if (!note) {
        return
      }

      const desiredX = action.payload.pointerX - interaction.pointerOffsetX
      const desiredY = action.payload.pointerY - interaction.pointerOffsetY
      const clamped = clampNotePosition(
        desiredX,
        desiredY,
        note.width,
        note.height,
        action.payload.boardRect,
      )

      note.x = clamped.x
      note.y = clamped.y
      setNoteUpdatedAt(note)
    },
    beginResize(
      state,
      action: PayloadAction<{ noteId: NoteId; pointerX: number; pointerY: number }>,
    ) {
      const note = findNote(state, action.payload.noteId)
      if (!note) {
        return
      }

      state.interaction = {
        noteId: note.id,
        mode: 'resize',
        pointerOffsetX: 0,
        pointerOffsetY: 0,
        startWidth: note.width,
        startHeight: note.height,
        startPointerX: action.payload.pointerX,
        startPointerY: action.payload.pointerY,
        overTrash: false,
      }
    },
    updateResize(
      state,
      action: PayloadAction<{ pointerX: number; pointerY: number; boardRect: BoardRect }>,
    ) {
      const { interaction } = state
      if (interaction.mode !== 'resize' || !interaction.noteId) {
        return
      }

      const note = findNote(state, interaction.noteId)
      if (!note) {
        return
      }

      const deltaX = action.payload.pointerX - interaction.startPointerX
      const deltaY = action.payload.pointerY - interaction.startPointerY
      const maxWidth = action.payload.boardRect.width - note.x
      const maxHeight = action.payload.boardRect.height - note.y

      note.width = clampNoteWidth(Math.min(interaction.startWidth + deltaX, maxWidth))
      note.height = clampNoteHeight(Math.min(interaction.startHeight + deltaY, maxHeight))
      setNoteUpdatedAt(note)
    },
    constrainNotesToBoard(state, action: PayloadAction<{ boardRect: BoardRect }>) {
      const { boardRect } = action.payload
      const maxBoardWidth = Math.max(1, boardRect.width - BOARD_PADDING * 2)
      const maxBoardHeight = Math.max(1, boardRect.height - BOARD_PADDING * 2)

      state.notes.forEach((note) => {
        const nextWidth = clamp(note.width, 1, maxBoardWidth)
        const nextHeight = clamp(note.height, 1, maxBoardHeight)
        const nextPosition = clampNotePosition(note.x, note.y, nextWidth, nextHeight, boardRect)

        if (
          note.width !== nextWidth ||
          note.height !== nextHeight ||
          note.x !== nextPosition.x ||
          note.y !== nextPosition.y
        ) {
          note.width = nextWidth
          note.height = nextHeight
          note.x = nextPosition.x
          note.y = nextPosition.y
          setNoteUpdatedAt(note)
        }
      })
    },
    setOverTrash(state, action: PayloadAction<{ overTrash: boolean }>) {
      state.interaction.overTrash = action.payload.overTrash
    },
    clearInteraction(state) {
      state.interaction = createDefaultInteraction()
    },
    setSyncStatus(state, action: PayloadAction<NotesState['syncStatus']>) {
      state.syncStatus = action.payload
    },
  },
})

export const {
  addNote,
  beginDrag,
  beginResize,
  bringToFront,
  clearInteraction,
  constrainNotesToBoard,
  removeNote,
  setNotes,
  setOverTrash,
  setSyncStatus,
  updateDragPosition,
  updateNoteColor,
  updateNoteText,
  updateResize,
} = notesSlice.actions

export default notesSlice.reducer
