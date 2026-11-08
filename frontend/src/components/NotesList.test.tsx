import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotesList } from './NotesList'
import * as notesApi from '../query/notes'

vi.mock('../query/notes', async () => {
  const actual = await vi.importActual<typeof import('../query/notes')>('../query/notes')
  return {
    ...actual,
    createNote: vi.fn(),
    listNotes: vi.fn(),
    deleteNote: vi.fn(),
  }
})

function renderList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <NotesList />
    </QueryClientProvider>,
  )
}

describe('NotesList', () => {
  beforeEach(() => {
    vi.mocked(notesApi.listNotes).mockReset()
    vi.mocked(notesApi.deleteNote).mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows a loading state', () => {
    vi.mocked(notesApi.listNotes).mockImplementation(() => new Promise(() => undefined))
    renderList()
    expect(screen.getByText(/loading notes/i)).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    vi.mocked(notesApi.listNotes).mockResolvedValue([])
    renderList()
    expect(await screen.findByText(/no notes yet/i)).toBeInTheDocument()
  })

  it('renders returned notes', async () => {
    vi.mocked(notesApi.listNotes).mockResolvedValue([
      { id: 1, content: 'Read about OpenAPI', createdAt: '2026-11-08T21:00:00.000Z' },
      { id: 2, content: 'Practice React Hook Form', createdAt: '2026-11-08T21:01:00.000Z' },
    ])
    renderList()

    expect(await screen.findByText('Read about OpenAPI')).toBeInTheDocument()
    expect(screen.getByText('Practice React Hook Form')).toBeInTheDocument()
  })

  it('shows an error state when listing fails', async () => {
    vi.mocked(notesApi.listNotes).mockRejectedValue(
      new notesApi.NotesApiError('Boom', 500),
    )
    renderList()
    expect(await screen.findByText(/boom/i)).toBeInTheDocument()
  })

  it('invokes deleteNote and refreshes the list', async () => {
    const user = userEvent.setup()
    let notes = [
      { id: 7, content: 'Temporary note', createdAt: '2026-11-08T21:00:00.000Z' },
    ]
    vi.mocked(notesApi.listNotes).mockImplementation(async () => notes)
    vi.mocked(notesApi.deleteNote).mockImplementation(async (id) => {
      notes = notes.filter((note) => note.id !== id)
    })

    renderList()
    expect(await screen.findByText('Temporary note')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete note: temporary note/i }))

    await waitFor(() => {
      expect(notesApi.deleteNote.mock.calls[0]?.[0]).toBe(7)
    })
    await waitFor(() => {
      expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
    })
  })
})
