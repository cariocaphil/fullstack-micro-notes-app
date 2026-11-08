import { afterEach, describe, expect, it, vi } from 'vitest'
import { notesApi } from './client'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('notesApi relative URL behavior', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('listNotes calls relative GET /api/notes', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = String(input)
      expect(url.startsWith('http')).toBe(false)
      expect(url).toBe('/api/notes')
      return jsonResponse([])
    })
    vi.stubGlobal('fetch', fetchMock)

    await notesApi.get('/api/notes')

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('/api/notes')
    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.method?.toUpperCase()).toBe('GET')
  })

  it('createNote calls relative POST /api/notes', async () => {
    const created = {
      id: 1,
      content: 'Buy milk',
      createdAt: '2026-11-08T21:00:00.000Z',
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      expect(String(input)).toBe('/api/notes')
      return jsonResponse(created, 201)
    })
    vi.stubGlobal('fetch', fetchMock)

    await notesApi.post('/api/notes', { body: { content: 'Buy milk' } })

    expect(fetchMock).toHaveBeenCalledOnce()
    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.method?.toUpperCase()).toBe('POST')
  })

  it('deleteNote calls relative DELETE /api/notes/{id}', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      expect(String(input)).toBe('/api/notes/42')
      return new Response(null, { status: 204 })
    })
    vi.stubGlobal('fetch', fetchMock)

    await notesApi.delete('/api/notes/{id}', { path: { id: 42 } })

    expect(fetchMock).toHaveBeenCalledOnce()
    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.method?.toUpperCase()).toBe('DELETE')
  })
})
