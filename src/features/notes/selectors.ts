import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'

export const selectNotesState = (state: RootState) => state.notes

export const selectNotes = (state: RootState) => selectNotesState(state).notes

export const selectInteraction = (state: RootState) => selectNotesState(state).interaction

export const selectSyncStatus = (state: RootState) => selectNotesState(state).syncStatus

export const selectOrderedNotes = createSelector([selectNotes], (notes) =>
  [...notes].sort((a, b) => a.zIndex - b.zIndex),
)
