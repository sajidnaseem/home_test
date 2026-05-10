import type { BoardRect } from '../features/notes/types'
import { BOARD_PADDING, NOTE_LIMITS } from './constants'

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const clampNoteWidth = (width: number): number =>
  clamp(width, NOTE_LIMITS.minWidth, NOTE_LIMITS.maxWidth)

export const clampNoteHeight = (height: number): number =>
  clamp(height, NOTE_LIMITS.minHeight, NOTE_LIMITS.maxHeight)

export const clampNotePosition = (
  x: number,
  y: number,
  width: number,
  height: number,
  boardRect: BoardRect,
): { x: number; y: number } => {
  const maxX = Math.max(BOARD_PADDING, boardRect.width - width - BOARD_PADDING)
  const maxY = Math.max(BOARD_PADDING, boardRect.height - height - BOARD_PADDING)

  return {
    x: clamp(x, BOARD_PADDING, maxX),
    y: clamp(y, BOARD_PADDING, maxY),
  }
}
