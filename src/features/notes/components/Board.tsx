import { useCallback, useEffect, useMemo, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import {
  addNote,
  beginDrag,
  beginResize,
  bringToFront,
  clearInteraction,
  constrainNotesToBoard,
  removeNote,
  setOverTrash,
  updateDragPosition,
  updateNoteColor,
  updateNoteText,
  updateResize,
} from '../notesSlice'
import { selectInteraction, selectOrderedNotes } from '../selectors'
import type { BoardRect } from '../types'
import { clampNoteHeight, clampNotePosition, clampNoteWidth } from '../../../utils/geometry'
import NoteCard from './NoteCard'
import TrashZone from './TrashZone'

interface BoardProps {
  createMode: boolean
  draftWidth: number
  draftHeight: number
  draftColor: string
}

const Board = ({ createMode, draftWidth, draftHeight, draftColor }: BoardProps) => {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const trashRef = useRef<HTMLDivElement | null>(null)
  const dispatch = useAppDispatch()
  const notes = useAppSelector(selectOrderedNotes)
  const interaction = useAppSelector(selectInteraction)

  const activeNote = useMemo(
    () => notes.find((note) => note.id === interaction.noteId) ?? null,
    [interaction.noteId, notes],
  )

  const getBoardRect = useCallback((): BoardRect => {
    const boardEl = boardRef.current
    if (!boardEl) {
      return { width: 0, height: 0 }
    }

    return {
      width: boardEl.clientWidth,
      height: boardEl.clientHeight,
    }
  }, [])

  const toBoardPoint = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    const boardEl = boardRef.current
    if (!boardEl) {
      return { x: 0, y: 0 }
    }

    const rect = boardEl.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  const isInsideBoard = useCallback((clientX: number, clientY: number): boolean => {
    const boardEl = boardRef.current
    if (!boardEl) {
      return false
    }

    const rect = boardEl.getBoundingClientRect()
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    )
  }, [])

  const updateTrashHover = useCallback(
    (clientX: number, clientY: number, noteRect?: { left: number; right: number; top: number; bottom: number }) => {
      const trashEl = trashRef.current
      if (!trashEl) {
        dispatch(setOverTrash({ overTrash: false }))
        return
      }

      const rect = trashEl.getBoundingClientRect()
      const overTrash = noteRect
        ? !(
            noteRect.right < rect.left ||
            noteRect.left > rect.right ||
            noteRect.bottom < rect.top ||
            noteRect.top > rect.bottom
          )
        : clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
      dispatch(setOverTrash({ overTrash }))
    },
    [dispatch],
  )

  const onBeginDrag = useCallback(
    (noteId: string, clientX: number, clientY: number): void => {
      const point = toBoardPoint(clientX, clientY)
      dispatch(bringToFront({ noteId }))
      dispatch(beginDrag({ noteId, pointerX: point.x, pointerY: point.y }))
    },
    [dispatch, toBoardPoint],
  )

  const onBeginResize = useCallback(
    (noteId: string, clientX: number, clientY: number): void => {
      const point = toBoardPoint(clientX, clientY)
      dispatch(bringToFront({ noteId }))
      dispatch(beginResize({ noteId, pointerX: point.x, pointerY: point.y }))
    },
    [dispatch, toBoardPoint],
  )

  useEffect(() => {
    if (!interaction.mode || !interaction.noteId) {
      return
    }

    const onWindowPointerMove = (event: PointerEvent): void => {
      if (!isInsideBoard(event.clientX, event.clientY) && interaction.mode !== 'drag') {
        dispatch(setOverTrash({ overTrash: false }))
        return
      }

      const point = toBoardPoint(event.clientX, event.clientY)
      const boardRect = getBoardRect()

      if (interaction.mode === 'drag') {
        dispatch(updateDragPosition({ pointerX: point.x, pointerY: point.y, boardRect }))
        if (activeNote && boardRef.current) {
          const boardClientRect = boardRef.current.getBoundingClientRect()
          const desiredX = point.x - interaction.pointerOffsetX
          const desiredY = point.y - interaction.pointerOffsetY
          const clamped = clampNotePosition(desiredX, desiredY, activeNote.width, activeNote.height, boardRect)
          updateTrashHover(event.clientX, event.clientY, {
            left: boardClientRect.left + clamped.x,
            right: boardClientRect.left + clamped.x + activeNote.width,
            top: boardClientRect.top + clamped.y,
            bottom: boardClientRect.top + clamped.y + activeNote.height,
          })
        } else {
          updateTrashHover(event.clientX, event.clientY)
        }
        return
      }

      dispatch(updateResize({ pointerX: point.x, pointerY: point.y, boardRect }))
    }

    const onWindowPointerUp = (): void => {
      if (interaction.mode === 'drag' && interaction.noteId && interaction.overTrash) {
        dispatch(removeNote({ noteId: interaction.noteId }))
      }
      dispatch(clearInteraction())
    }

    window.addEventListener('pointermove', onWindowPointerMove)
    window.addEventListener('pointerup', onWindowPointerUp)

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove)
      window.removeEventListener('pointerup', onWindowPointerUp)
    }
  }, [activeNote, dispatch, getBoardRect, interaction, isInsideBoard, toBoardPoint, updateTrashHover])

  const onBoardPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!createMode || event.target !== event.currentTarget) {
      return
    }

    const point = toBoardPoint(event.clientX, event.clientY)
    const boardRect = getBoardRect()
    const width = clampNoteWidth(draftWidth)
    const height = clampNoteHeight(draftHeight)
    const position = clampNotePosition(point.x, point.y, width, height, boardRect)

    dispatch(
      addNote({
        x: position.x,
        y: position.y,
        width,
        height,
        color: draftColor,
      }),
    )
  }

  const onBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Delete' || !activeNote) {
      return
    }

    dispatch(removeNote({ noteId: activeNote.id }))
    dispatch(clearInteraction())
  }

  useEffect(() => {
    const boardEl = boardRef.current
    if (!boardEl) {
      return
    }

    const syncNotesToBoard = (): void => {
      dispatch(constrainNotesToBoard({ boardRect: getBoardRect() }))
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncNotesToBoard) : null
    resizeObserver?.observe(boardEl)
    window.addEventListener('resize', syncNotesToBoard)
    syncNotesToBoard()

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', syncNotesToBoard)
    }
  }, [dispatch, getBoardRect])

  return (
    <section className="board-shell">
      <div
        className={`notes-board ${createMode ? 'is-create-mode' : ''}`}
        onPointerDown={onBoardPointerDown}
        onKeyDown={onBoardKeyDown}
        aria-label="Sticky notes board"
        tabIndex={0}
        ref={boardRef}
      >
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={interaction.noteId === note.id}
            overTrash={interaction.overTrash}
            onBeginDrag={onBeginDrag}
            onBeginResize={onBeginResize}
            onChangeText={(noteId, text) => dispatch(updateNoteText({ noteId, text }))}
            onChangeColor={(noteId, color) => dispatch(updateNoteColor({ noteId, color }))}
          />
        ))}

        <div ref={trashRef} className="trash-wrapper">
          <TrashZone overTrash={interaction.overTrash} />
        </div>
      </div>
    </section>
  )
}

export default Board
