# Sticky Notes SPA

Single-page sticky notes app built with React, TypeScript, Redux Toolkit, and RTK Query.

## Features

- Create notes with selected width, height, and color
- Move notes with pointer drag
- Resize notes using a corner handle
- Delete notes by dropping over a trash zone
- Edit note text inline
- Change note colors from note palette
- Bring active notes to front (`zIndex`)
- Persist notes locally and sync with mocked remote API

## Tech Stack

- React 19 + TypeScript
- Redux Toolkit (state + reducers)
- RTK Query (mocked async API)
- Vite (dev/build)
- ESLint + TypeScript type checking

## Folder Structure

```text
.
├── index.html
├── package.json
├── README.md
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── app
│   │   ├── common
│   │   │   └── NotesToolbar.tsx
│   │   └── store
│   │       ├── hooks.ts
│   │       └── store.ts
│   ├── components
│   │   └── ColorSwatches.tsx
│   ├── features
│   │   └── notes
│   │       ├── components
│   │       │   ├── Board.tsx
│   │       │   ├── NoteCard.tsx
│   │       │   └── TrashZone.tsx
│   │       ├── notesApi.ts
│   │       ├── notesSlice.ts
│   │       ├── selectors.ts
│   │       └── types.ts
│   ├── hooks
│   │   └── useNotesSync.ts
│   ├── styles
│   │   └── index.css
│   └── utils
│       ├── constants.ts
│       ├── geometry.ts
│       ├── mergeNotes.ts
│       └── storage.ts
├── tsconfig.json
└── vite.config.ts
```

## Architecture Design

The application follows a feature-first, layered front-end architecture. Rendering starts in `main.tsx`, where the Redux store is provided to the app. `App.tsx` orchestrates global UI state (note creation mode and draft settings), mounts the toolbar, and delegates board interactions to the notes feature. State management is centralized in `notesSlice`, which stores note entities and interaction metadata (active note, drag/resize mode, pointer offsets, trash hover, and sync status). This creates a predictable, reducer-driven flow for all interactive operations.

The notes feature is organized by responsibility: `Board` handles pointer lifecycle and board-space coordinate calculations, `NoteCard` encapsulates per-note UI/edit interactions, and `TrashZone` provides visual delete feedback. Domain utilities (`geometry.ts`) enforce constraints such as clamped size and board-bounded positioning, while selectors provide stable read access patterns (`selectOrderedNotes`, `selectInteraction`, `selectSyncStatus`). The result is a clean split between presentation, interaction logic, and domain rules.

Persistence uses a dual-source strategy implemented in `useNotesSync`. Notes are first hydrated from `localStorage` for fast startup, then merged with remote notes fetched via RTK Query (`notesApi`) using conflict resolution by `updatedAt` (`mergeNotesByNewest`). After hydration, note changes are debounced, written back to `localStorage`, and sent to the mocked async API (`saveNotes`). This design keeps the UI responsive offline-first while still modeling realistic remote synchronization states (`idle`, `saving`, `saved`, `error`).

## Run Locally

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Build production bundle:
   - `npm run build`
4. Preview production build:
   - `npm run preview`

## Quality Checks

- Type check: `npm run typecheck`
- Lint: `npm run lint`
  > > > > > > > 545e901 (Initial commit: sticky notes SPA)
