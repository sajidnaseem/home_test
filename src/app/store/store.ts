import { configureStore } from '@reduxjs/toolkit'
import notesReducer from '../../features/notes/notesSlice'
import { notesApi } from '../../features/notes/notesApi'

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    [notesApi.reducerPath]: notesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(notesApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
