import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KolAlert, KolButton } from '@public-ui/react-v19'
import { deleteNote, listNotes, noteKeys, NotesApiError } from '../query/notes'

export function NotesList() {
  const queryClient = useQueryClient()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const notesQuery = useQuery({
    queryKey: noteKeys.all,
    queryFn: listNotes,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: async () => {
      setDeleteError(null)
      await queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })

  async function handleDelete(id: number) {
    setDeleteError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      const message =
        error instanceof NotesApiError
          ? error.message
          : 'Could not delete the note. Please try again.'
      setDeleteError(message)
    }
  }

  return (
    <section aria-labelledby="saved-notes-heading">
      <h2 id="saved-notes-heading">Saved notes</h2>

      {deleteError ? (
        <KolAlert _label="Could not delete note" _type="error" _variant="card">
          {deleteError}
        </KolAlert>
      ) : null}

      {notesQuery.isPending ? (
        <p aria-live="polite" aria-busy="true">
          Loading notes…
        </p>
      ) : null}

      {notesQuery.isError ? (
        <KolAlert _label="Could not load notes" _type="error" _variant="card">
          {notesQuery.error instanceof NotesApiError
            ? notesQuery.error.message
            : 'Failed to load notes.'}
        </KolAlert>
      ) : null}

      {notesQuery.isSuccess && notesQuery.data.length === 0 ? (
        <p aria-live="polite">No notes yet. Create your first note above.</p>
      ) : null}

      {notesQuery.isSuccess && notesQuery.data.length > 0 ? (
        <ul className="notes-list">
          {notesQuery.data.map((note) => (
            <li key={note.id} className="notes-list__item">
              <span>{note.content}</span>
              <KolButton
                _label={`Delete note: ${note.content}`}
                _variant="danger"
                _disabled={deleteMutation.isPending}
                _on={{
                  onClick: () => {
                    void handleDelete(note.id)
                  },
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
