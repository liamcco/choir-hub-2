'use client'

import { useForm, useSelector } from '@tanstack/react-form'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { createImportedUsersAction, validateUserImportAction } from './actions'

const CsvFormSchema = z.object({ csv: z.string().min(1, 'Choose a CSV file.') })

export function ValidateMemberImportForm({
  onValidated,
  onFileSelected,
}: {
  onValidated: (validation: Awaited<ReturnType<typeof validateUserImportAction>>, csv: string) => void
  onFileSelected: () => void
}) {
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const form = useForm({
    defaultValues: { csv: '' },
    validators: { onSubmit: CsvFormSchema },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.set('csv', value.csv)
      onValidated(await validateUserImportAction(null, formData), value.csv)
    },
  })
  const csv = useSelector(form.store, (state) => state.values.csv)

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    form.setFieldValue('csv', await file.text())
    onFileSelected()
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="csv">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="user-import-file">CSV file</FieldLabel>
                <Input
                  ref={inputRef}
                  id="user-import-file"
                  type="file"
                  accept=".csv,text/csv"
                  onBlur={field.handleBlur}
                  onChange={onFileChange}
                  aria-invalid={isInvalid}
                />
                <p className="text-sm text-muted-foreground">
                  {fileName || 'Maximum 50 users. Extra columns are ignored.'}
                </p>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
      <Button type="submit" disabled={form.state.isSubmitting || !csv}>
        {form.state.isSubmitting ? 'Checking CSV' : 'Validate CSV'}
      </Button>
    </form>
  )
}

export function CreateImportedUsersForm({
  csv,
  onComplete,
}: {
  csv: string
  onComplete: (result: Awaited<ReturnType<typeof createImportedUsersAction>>) => void
}) {
  const form = useForm({
    defaultValues: { csv },
    validators: { onSubmit: CsvFormSchema },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.set('csv', value.csv)
      onComplete(await createImportedUsersAction(null, formData))
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      noValidate
    >
      <Button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Creating users' : 'Create users'}
      </Button>
    </form>
  )
}
