import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { KolAlert, KolButton, KolInputText } from '@public-ui/react-v19'
import { CreateNoteRequest } from '../api/schemas'
import { createNote, noteKeys, NotesApiError } from '../query/notes'

type CreateNoteValues = {
  content: string
}

export function NoteForm() {
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitted },
  } = useForm<CreateNoteValues>({
    resolver: zodResolver(CreateNoteRequest),
    mode: 'onBlur',
    defaultValues: { content: '' },
  })

  const createMutation = useMutation({
    mutationFn: (values: CreateNoteValues) => createNote(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null)
    try {
      await createMutation.mutateAsync(values)
      reset()
    } catch (error) {
      const message =
        error instanceof NotesApiError
          ? error.message
          : 'Could not save the note. Please try again.'
      setApiError(message)
    }
  })

  return (
    <section aria-labelledby="new-note-heading">
      <h2 id="new-note-heading">New note</h2>

      {apiError ? (
        <KolAlert _label="Could not save note" _type="error" _variant="card">
          {apiError}
        </KolAlert>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <Controller
          name="content"
          control={control}
          render={({ field, fieldState }) => (
            <KolInputText
              _label="Note content"
              _name={field.name}
              _placeholder="Enter a note..."
              _value={field.value}
              _touched={fieldState.isTouched || isSubmitted}
              _msg={
                fieldState.error?.message
                  ? { _description: fieldState.error.message, _type: 'error' }
                  : undefined
              }
              _disabled={createMutation.isPending}
              _on={{
                // KoliBri EventValueCallback: (event, value) — use value, not event.target.value
                onInput: (_event, value) => {
                  field.onChange(typeof value === 'string' ? value : String(value ?? ''))
                },
                onBlur: field.onBlur,
              }}
              // Host ref is the web component (focus() via FocusableElement), not the shadow input
              ref={field.ref}
            />
          )}
        />

        <div className="form-actions">
          <KolButton
            _label={createMutation.isPending ? 'Saving…' : 'Save note'}
            _type="submit"
            _variant="primary"
            _disabled={createMutation.isPending}
          />
        </div>
      </form>
    </section>
  )
}
