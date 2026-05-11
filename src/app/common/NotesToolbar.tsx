import ColorSwatches from '../../components/ColorSwatches'
import type { NotesState } from '../../features/notes/types'
import { NOTE_COLORS, NOTE_LIMITS } from '../../utils/constants'
import { clampNoteHeight, clampNoteWidth } from '../../utils/geometry'

interface NotesToolbarProps {
  createMode: boolean
  draftWidth: number
  draftHeight: number
  draftColor: string
  isRemoteLoading: boolean
  hasRemoteError: boolean
  syncStatus: NotesState['syncStatus']
  onDraftWidthChange: (nextWidth: number) => void
  onDraftHeightChange: (nextHeight: number) => void
  onDraftColorChange: (nextColor: string) => void
  onToggleCreateMode: () => void
}

const NotesToolbar = ({
  createMode,
  draftWidth,
  draftHeight,
  draftColor,
  isRemoteLoading,
  hasRemoteError,
  syncStatus,
  onDraftWidthChange,
  onDraftHeightChange,
  onDraftColorChange,
  onToggleCreateMode,
}: NotesToolbarProps) => (
  <header className="toolbar">
    <h1>Sticky Notes</h1>
    <div className="toolbar-controls">
      <label>
        Width
        <input
          type="number"
          min={NOTE_LIMITS.minWidth}
          max={NOTE_LIMITS.maxWidth}
          value={draftWidth}
          onChange={(event) => onDraftWidthChange(clampNoteWidth(Number(event.target.value)))}
        />
      </label>

      <label>
        Height
        <input
          type="number"
          min={NOTE_LIMITS.minHeight}
          max={NOTE_LIMITS.maxHeight}
          value={draftHeight}
          onChange={(event) => onDraftHeightChange(clampNoteHeight(Number(event.target.value)))}
        />
      </label>

      <div className="toolbar-colors">
        <span>Color</span>
        <ColorSwatches
          colors={NOTE_COLORS}
          activeColor={draftColor}
          onSelect={onDraftColorChange}
          label="Choose new note color"
        />
      </div>

      <button type="button" className="create-note-button" onClick={onToggleCreateMode}>
        {createMode ? 'Exit create mode' : 'Create note'}
      </button>
    </div>

    <p className="status-copy" aria-live="polite">
      {isRemoteLoading && 'Loading remote notes...'}
      {!isRemoteLoading && hasRemoteError && 'Remote sync unavailable. Local storage still works.'}
      {!isRemoteLoading && !hasRemoteError && syncStatus === 'saving' && 'Saving notes...'}
      {!isRemoteLoading && !hasRemoteError && syncStatus === 'saved' && 'All changes saved.'}
      {!isRemoteLoading && !hasRemoteError && syncStatus === 'error' && 'Could not save remotely.'}
      {!isRemoteLoading && !hasRemoteError && syncStatus === 'idle' && 'Ready.'}
    </p>
  </header>
)

export default NotesToolbar
