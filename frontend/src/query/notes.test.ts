import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createNote, deleteNote, listNotes, NotesApiError } from './notes'
import { notesApi } from '../api/client'
import { TypedStatusError } from '../api/generated/api'

vi.mock('../api/client', () => ({
  notesApi: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('notes query wrappers', () => {
  beforeEach(() => {
    vi.mocked(notesApi.get).mockReset()
    vi.mocked(notesApi.post).mockReset()
    vi.mocked(notesApi.delete).mockReset()
  })

  it('listNotes requests with throwOnStatusError', async () => {
    vi.mocked(notesApi.get).mockResolvedValue([])
    await listNotes()
    expect(notesApi.get).toHaveBeenCalledWith('/api/notes', { throwOnStatusError: true })
  })

  it('createNote rejects unsuccessful HTTP as NotesApiError', async () => {
    vi.mocked(notesApi.post).mockRejectedValue(
      new TypedStatusError({
        ok: false,
        status: 400,
        data: { code: 'VALIDATION_ERROR', message: 'Invalid note' },
        json: async () => ({ code: 'VALIDATION_ERROR', message: 'Invalid note' }),
        headers: new Headers(),
      } as never),
    )

    await expect(createNote({ content: 'Buy milk' })).rejects.toBeInstanceOf(NotesApiError)
  })

  it('deleteNote rejects unsuccessful HTTP as NotesApiError', async () => {
    vi.mocked(notesApi.delete).mockRejectedValue(
      new TypedStatusError({
        ok: false,
        status: 404,
        data: { code: 'NOTE_NOT_FOUND', message: 'Note not found: 9' },
        json: async () => ({ code: 'NOTE_NOT_FOUND', message: 'Note not found: 9' }),
        headers: new Headers(),
      } as never),
    )

    await expect(deleteNote(9)).rejects.toMatchObject({
      message: 'Note not found: 9',
      status: 404,
      code: 'NOTE_NOT_FOUND',
    })
  })
})
