import { memo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import ColorSwatches from '../../../components/ColorSwatches'
import { NOTE_COLORS } from '../../../utils/constants'
import type { Note } from '../types'

interface NoteCardProps {
  note: Note
  isActive: boolean
  overTrash: boolean
  onBeginDrag: (noteId: string, pointerX: number, pointerY: number) => void
  onBeginResize: (noteId: string, pointerX: number, pointerY: number) => void
  onChangeText: (noteId: string, text: string) => void
  onChangeColor: (noteId: string, color: string) => void
}



const NoteCard = ({
  note,
  isActive,
  overTrash,
  onBeginDrag,
  onBeginResize,
  onChangeText,
  onChangeColor,
}: NoteCardProps) => {
  const [isColorOpen, setIsColorOpen] = useState(false)
  const isDeletePreview = overTrash && isActive

  const onNotePointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    const target = event.target as HTMLElement
    if (
      target.closest('.note-resize-handle') ||
      target.closest('textarea') ||
      target.closest('button') ||
      target.closest('.note-color-popover')
    ) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    onBeginDrag(note.id, event.clientX, event.clientY)
  }

  const onResizePointerDown = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    onBeginResize(note.id, event.clientX, event.clientY)
  }

  return (
    <article
      className={`note-card ${isActive ? 'is-active' : ''} ${isDeletePreview ? 'is-over-trash is-delete-preview' : ''}`}
      style={{
        width: `${note.width}px`,
        height: `${note.height}px`,
        transform: `translate(${note.x}px, ${note.y}px)`,
        zIndex: note.zIndex,
      }}
      onPointerDown={onNotePointerDown}
      aria-label="Sticky note"
    >
      {isDeletePreview ? (
        <div className="note-delete-preview" aria-hidden="true">
          <svg className="note-delete-icon" viewBox="0 0 24 24" width="14" height="14">
            <path d="M8 4h8l1 2h4v2H3V6h4l1-2zm1 6h2v8H9v-8zm4 0h2v8h-2v-8z" />
          </svg>
        </div>
      ) : (
        <>
          <header className="note-header" style={{ backgroundColor: note.color }}>
            <span className="note-label">Note</span>
            <div className="note-header-tools">
              <button
                type="button"
                className="note-color-trigger"
                onClick={() => setIsColorOpen((prev) => !prev)}
                aria-label="Toggle note colors"
                aria-expanded={isColorOpen}
              >
                <svg className="note-color-trigger-icon" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
                  <path d="M12 7a1.9 1.9 0 1 0 0-3.8A1.9 1.9 0 0 0 12 7zm0 7a1.9 1.9 0 1 0 0-3.8A1.9 1.9 0 0 0 12 14zm0 7a1.9 1.9 0 1 0 0-3.8A1.9 1.9 0 0 0 12 21z" />
                </svg>
              </button>

              {isColorOpen ? (
                <div className="note-color-popover">
                  <ColorSwatches
                    colors={NOTE_COLORS}
                    activeColor={note.color}
                    onSelect={(color) => {
                      onChangeColor(note.id, color)
                      setIsColorOpen(false)
                    }}
                    label="Choose note color"
                    compact
                  />
                </div>
              ) : null}
            </div>
          </header>

          <textarea
            value={note.text}
            onChange={(event) => onChangeText(note.id, event.target.value)}
            className="note-text"
            placeholder="Write here..."
            aria-label="Note text"
          />

          <button
            type="button"
            className="note-resize-handle"
            onPointerDown={onResizePointerDown}
            aria-label="Resize note"
          >
            <svg
              className="note-resize-icon"
              viewBox="0 0 16 16"
              width="12"
              height="12"
              aria-hidden="true"
            >
              <path d="M6 14H4l10-10v2L6 14zM10 14H8l6-6v2l-4 4zM14 14h-2l2-2v2z" />
            </svg>
          </button>
        </>
      )}
    </article>
  )
}

export default memo(NoteCard)
