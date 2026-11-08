import { notesApi } from '../api/client'
import type { CreateNoteRequest } from '../api/schemas'
import { TypedStatusError } from '../api/generated/api'

export const noteKeys = {
  all: ['notes'] as const,
}

export class NotesApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'NotesApiError'
    this.status = status
    this.code = code
  }
}

function toNotesApiError(error: unknown): NotesApiError {
  if (error instanceof NotesApiError) {
    return error
  }
  if (error instanceof TypedStatusError) {
    const data = error.response.data as { code?: string; message?: string } | undefined
    return new NotesApiError(
      data?.message ?? `Request failed with status ${error.response.status}`,
      error.response.status,
      data?.code,
    )
  }
  if (error instanceof Error) {
    return new NotesApiError(error.message, 0)
  }
  return new NotesApiError('Unexpected API error', 0)
}

/**
 * Wrappers always reject on unsuccessful HTTP so TanStack Query / mutateAsync
 * treat failures as errors (typed-openapi can return results without throwing
 * depending on options).
 */
export async function listNotes() {
  try {
    return await notesApi.get('/api/notes', { throwOnStatusError: true })
  } catch (error) {
    throw toNotesApiError(error)
  }
}

export async function createNote(body: CreateNoteRequest) {
  try {
    return await notesApi.post('/api/notes', {
      body,
      throwOnStatusError: true,
    })
  } catch (error) {
    throw toNotesApiError(error)
  }
}

export async function deleteNote(id: number) {
  try {
    return await notesApi.delete('/api/notes/{id}', {
      path: { id },
      throwOnStatusError: true,
    })
  } catch (error) {
    throw toNotesApiError(error)
  }
}
