'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import z from 'zod'

import { createGroupKindFormSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import { FormError, FormTextInput } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { createGroupKindMutation } from '@/lib/api-client/@tanstack/react-query.gen'

const defaultGroupKindFormValues: z.input<typeof createGroupKindFormSchema> = {
  name: '',
  description: '',
}

export function CreateGroupKindCard({ onChanged }: { onChanged: () => Promise<unknown> }) {
  const mutation = useMutation(createGroupKindMutation())
  const form = useForm({
    defaultValues: defaultGroupKindFormValues,
    validators: {
      onSubmit: createGroupKindFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync({
          body: {
            name: value.name.trim(),
            description: value.description?.trim() || undefined,
          },
        })
        form.reset()
        await onChanged()
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = mutation.isPending || form.state.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Kind</CardTitle>
        <CardDescription>Add a controlled group classification.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <FormTextInput
                  id={field.name}
                  label="Name"
                  value={field.state.value}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <FormTextInput
                  id={field.name}
                  label="Description optional"
                  value={field.state.value ?? ''}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
              )}
            </form.Field>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isSaving}>
                  <Plus />
                  Create
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
        <FormError error={getErrorMessage(mutation.error)} />
      </CardContent>
    </Card>
  )
}
