import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Note } from './types'
import { API_LATENCY_MS } from '../../utils/constants'

let remoteNotesStore: Note[] = []

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

export const notesApi = createApi({
  reducerPath: 'notesApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Notes'],
  endpoints: (builder) => ({
    getNotes: builder.query<Note[], void>({
      async queryFn() {
        await delay(API_LATENCY_MS)
        return { data: remoteNotesStore }
      },
      providesTags: ['Notes'],
    }),
    saveNotes: builder.mutation<Note[], Note[]>({
      async queryFn(notes) {
        await delay(API_LATENCY_MS)
        remoteNotesStore = notes.map((note) => ({ ...note }))
        return { data: remoteNotesStore }
      },
      invalidatesTags: ['Notes'],
    }),
  }),
})

export const { useGetNotesQuery, useSaveNotesMutation } = notesApi
