import type { ComponentProps } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type FormFieldError = { message?: string } | undefined

export function FormError({ error }: { error: string | null }) {
  if (!error) {
    return null
  }

  return <p className="mt-4 text-sm text-destructive">{error}</p>
}

export function FormTextInput({
  id,
  label,
  value,
  errors = [],
  onValueChange,
  ...inputProps
}: Omit<ComponentProps<typeof Input>, 'id' | 'value' | 'onChange'> & {
  id: string
  label: string
  value: string
  errors?: FormFieldError[]
  onValueChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
        }}
        {...inputProps}
      />
      <FieldError errors={errors} />
    </Field>
  )
}

export function FormCheckboxField({
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={(value) => onCheckedChange(value === true)} />
      {label}
    </label>
  )
}
