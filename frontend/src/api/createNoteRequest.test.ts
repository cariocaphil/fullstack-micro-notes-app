import { describe, expect, it } from 'vitest'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateNoteRequest } from './schemas'

describe('CreateNoteRequest Zod schema', () => {
  it('accepts valid content', () => {
    const result = CreateNoteRequest.safeParse({ content: 'Buy milk' })
    expect(result.success).toBe(true)
  })

  it('rejects content shorter than 3 characters', () => {
    const result = CreateNoteRequest.safeParse({ content: 'ab' })
    expect(result.success).toBe(false)
  })

  it('rejects content longer than 100 characters', () => {
    const result = CreateNoteRequest.safeParse({ content: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects empty content', () => {
    const result = CreateNoteRequest.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })

  it('rejects whitespace-only content', () => {
    const result = CreateNoteRequest.safeParse({ content: '   ' })
    expect(result.success).toBe(false)
  })

  it('is a Zod object schema with content field', () => {
    expect(CreateNoteRequest.shape.content).toBeDefined()
  })
})

describe('CreateNoteRequest with zodResolver', () => {
  const resolver = zodResolver(CreateNoteRequest)

  async function validate(values: unknown) {
    return resolver(
      values as never,
      undefined,
      {
        criteriaMode: 'firstError',
        fields: {},
        shouldUseNativeValidation: false,
      },
    )
  }

  it('accepts valid input through zodResolver', async () => {
    const result = await validate({ content: 'Buy milk' })
    expect(result.errors).toEqual({})
    expect(result.values).toEqual({ content: 'Buy milk' })
  })

  it('rejects short content through zodResolver', async () => {
    const result = await validate({ content: 'ab' })
    expect(result.errors.content).toBeDefined()
  })

  it('rejects whitespace-only content through zodResolver', async () => {
    const result = await validate({ content: '   ' })
    expect(result.errors.content).toBeDefined()
  })
})
