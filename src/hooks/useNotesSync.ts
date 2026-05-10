import { useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../app/store/hooks'
import { useGetNotesQuery, useSaveNotesMutation } from '../features/notes/notesApi'
import { setNotes, setSyncStatus } from '../features/notes/notesSlice'
import { selectNotes } from '../features/notes/selectors'
import { loadNotesFromStorage, saveNotesToStorage } from '../utils/storage'
import { mergeNotesByNewest } from '../utils/mergeNotes'

interface SyncState {
  isRemoteLoading: boolean
  hasRemoteError: boolean
}

export const useNotesSync = (): SyncState => {
  const dispatch = useAppDispatch()
  const notes = useAppSelector(selectNotes)
  const [saveNotes] = useSaveNotesMutation()
  const { data: remoteNotes = [], isLoading: isRemoteLoading, isError: hasRemoteError } = useGetNotesQuery()
  const hasHydrated = useRef(false)
  const skipNextSave = useRef(true)

  const localNotes = useMemo(() => loadNotesFromStorage(), [])

  useEffect(() => {
    dispatch(setNotes(localNotes))
  }, [dispatch, localNotes])

  useEffect(() => {
    if (isRemoteLoading || hasHydrated.current) {
      return
    }

    const merged = mergeNotesByNewest(localNotes, remoteNotes)
    dispatch(setNotes(merged))
    hasHydrated.current = true
    skipNextSave.current = true
  }, [dispatch, isRemoteLoading, localNotes, remoteNotes])

  useEffect(() => {
    if (!hasHydrated.current) {
      return
    }

    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    const timeoutId = window.setTimeout(() => {
      saveNotesToStorage(notes)
      dispatch(setSyncStatus('saving'))
      void saveNotes(notes)
        .unwrap()
        .then(() => dispatch(setSyncStatus('saved')))
        .catch(() => dispatch(setSyncStatus('error')))
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [dispatch, notes, saveNotes])

  return {
    isRemoteLoading,
    hasRemoteError,
  }
}
