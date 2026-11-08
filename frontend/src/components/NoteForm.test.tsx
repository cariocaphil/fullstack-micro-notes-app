import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NoteForm } from './NoteForm'
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

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <NoteForm />
    </QueryClientProvider>,
  )
}

describe('NoteForm', () => {
  beforeEach(() => {
    vi.mocked(notesApi.createNote).mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('wires KoliBri-style onInput(event, value) into React Hook Form', async () => {
    const user = userEvent.setup()
    renderForm()

    const input = screen.getByRole('textbox', { name: /note content/i })
    await user.type(input, 'Buy milk')
    expect(input).toHaveValue('Buy milk')
  })

  it('shows accessible validation feedback for short content', async () => {
    const user = userEvent.setup()
    renderForm()

    const input = screen.getByRole('textbox', { name: /note content/i })
    await user.type(input, 'ab')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('rejects whitespace-only content', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByRole('textbox', { name: /note content/i }), '   ')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    expect(notesApi.createNote).not.toHaveBeenCalled()
  })

  it('submits valid content through the API wrapper', async () => {
    const user = userEvent.setup()
    vi.mocked(notesApi.createNote).mockResolvedValue({
      id: 1,
      content: 'Buy milk',
      createdAt: '2026-11-08T21:00:00.000Z',
    })
    renderForm()

    await user.type(screen.getByRole('textbox', { name: /note content/i }), 'Buy milk')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(notesApi.createNote).toHaveBeenCalledWith({ content: 'Buy milk' })
    })
  })

  it('resets the form after successful submission', async () => {
    const user = userEvent.setup()
    vi.mocked(notesApi.createNote).mockResolvedValue({
      id: 1,
      content: 'Buy milk',
      createdAt: '2026-11-08T21:00:00.000Z',
    })
    renderForm()

    const input = screen.getByRole('textbox', { name: /note content/i })
    await user.type(input, 'Buy milk')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('preserves the entered value when the API fails', async () => {
    const user = userEvent.setup()
    vi.mocked(notesApi.createNote).mockRejectedValue(
      new notesApi.NotesApiError('Server rejected note', 400, 'VALIDATION_ERROR'),
    )
    renderForm()

    const input = screen.getByRole('textbox', { name: /note content/i })
    await user.type(input, 'Buy milk')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(screen.getByText(/server rejected note/i)).toBeInTheDocument()
    })
    expect(input).toHaveValue('Buy milk')
  })

  it('disables submit while the create mutation is pending', async () => {
    const user = userEvent.setup()
    let resolveCreate: (value: unknown) => void = () => undefined
    vi.mocked(notesApi.createNote).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        }),
    )
    renderForm()

    await user.type(screen.getByRole('textbox', { name: /note content/i }), 'Buy milk')
    await user.click(screen.getByRole('button', { name: /save note/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })

    resolveCreate({
      id: 1,
      content: 'Buy milk',
      createdAt: '2026-11-08T21:00:00.000Z',
    })
  })
})
