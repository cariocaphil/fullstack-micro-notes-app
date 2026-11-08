import type { ReactNode } from 'react'

/**
 * Accessible HTML stand-ins that preserve KoliBri's React prop contract
 * (`_on.onInput(event, value)`, `_msg`, `_label`, etc.).
 *
 * happy-dom cannot boot KoliBri's lazy Stencil components (no shadow DOM),
 * so component tests use these doubles instead of the real web components.
 */
export function KolInputText(props: {
  _label: string
  _name?: string
  _value?: string
  _placeholder?: string
  _touched?: boolean
  _disabled?: boolean
  _msg?: string | { _description: string; _type?: string }
  _on?: {
    onInput?: (event: Event, value: unknown) => void
    onBlur?: (event: Event) => void
  }
  ref?: unknown
}) {
  const message =
    typeof props._msg === 'string' ? props._msg : props._msg?._description

  return (
    <label>
      {props._label}
      <input
        name={props._name}
        placeholder={props._placeholder}
        value={props._value ?? ''}
        disabled={props._disabled}
        aria-invalid={message ? true : undefined}
        onChange={(event) => {
          props._on?.onInput?.(event.nativeEvent, event.currentTarget.value)
        }}
        onBlur={(event) => {
          props._on?.onBlur?.(event.nativeEvent)
        }}
      />
      {message ? <span role="alert">{message}</span> : null}
    </label>
  )
}

export function KolButton(props: {
  _label: string
  _type?: 'button' | 'submit' | 'reset'
  _disabled?: boolean
  _variant?: string
  _on?: { onClick?: (event: Event) => void }
}) {
  return (
    <button
      type={props._type ?? 'button'}
      disabled={props._disabled}
      onClick={(event) => {
        props._on?.onClick?.(event.nativeEvent)
      }}
    >
      {props._label}
    </button>
  )
}

export function KolAlert(props: {
  _label: string
  _type?: string
  _variant?: string
  children?: ReactNode
}) {
  return (
    <div role="alert">
      <strong>{props._label}</strong>
      <div>{props.children}</div>
    </div>
  )
}
