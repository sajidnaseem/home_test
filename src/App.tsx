import { useState } from 'react'
import Board from './features/notes/components/Board'
import { NOTE_COLORS, NOTE_LIMITS } from './utils/constants'
import { useNotesSync } from './hooks/useNotesSync'
import { useAppSelector } from './app/store/hooks'
import { selectSyncStatus } from './features/notes/selectors'
import NotesToolbar from './app/common/NotesToolbar'

const App = () => {
  const [createMode, setCreateMode] = useState(false)
  const [draftWidth, setDraftWidth] = useState(NOTE_LIMITS.minWidth)
  const [draftHeight, setDraftHeight] = useState(NOTE_LIMITS.minHeight)
  const [draftColor, setDraftColor] = useState<string>(NOTE_COLORS[0])
  const { isRemoteLoading, hasRemoteError } = useNotesSync()
  const syncStatus = useAppSelector(selectSyncStatus)

  return (
    <main className="app-shell">
      <NotesToolbar
        createMode={createMode}
        draftWidth={draftWidth}
        draftHeight={draftHeight}
        draftColor={draftColor}
        isRemoteLoading={isRemoteLoading}
        hasRemoteError={hasRemoteError}
        syncStatus={syncStatus}
        onDraftWidthChange={setDraftWidth}
        onDraftHeightChange={setDraftHeight}
        onDraftColorChange={setDraftColor}
        onToggleCreateMode={() => setCreateMode((value) => !value)}
      />

      <Board createMode={createMode} draftWidth={draftWidth} draftHeight={draftHeight} draftColor={draftColor} />
    </main>
  )
}

export default App
