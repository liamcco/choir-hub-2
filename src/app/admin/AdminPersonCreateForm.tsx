'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import z from 'zod'

import { provisionPeopleMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { getErrorMessage } from '@/common/errors/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { ProvisionResult } from './ProvisionResult'

const provisionFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Email must be valid'),
  password: z
    .string()
    .max(128, 'Password is too long')
    .refine((password) => !password || password.length >= 8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']),
})

type ProvisionFormValues = z.infer<typeof provisionFormSchema>

const defaultProvisionFormValues: ProvisionFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'user',
}

type AdminPersonCreateFormProps = {
  onPeopleChanged: () => Promise<unknown>
}

export function AdminPersonCreateForm({ onPeopleChanged }: AdminPersonCreateFormProps) {
  const provisionMutation = useMutation(provisionPeopleMutation())

  const form = useForm({
    defaultValues: defaultProvisionFormValues,
    validators: {
      onSubmit: provisionFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await provisionMutation.mutateAsync({
          body: {
            people: [
              {
                name: value.name.trim(),
                email: value.email.trim(),
                password: value.password.trim() || undefined,
                role: value.role,
              },
            ],
          },
        })

        form.reset()
        await onPeopleChanged()
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = provisionMutation.isPending || form.state.isSubmitting
  const provisionError = getErrorMessage(provisionMutation.error)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Person</CardTitle>
        <CardDescription>Provision a Better Auth user and matching application person.</CardDescription>
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
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    disabled={isSaving}
                    autoComplete="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    disabled={isSaving}
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Temporary password optional</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    disabled={isSaving}
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>

            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  <select
                    id={field.name}
                    name={field.name}
                    disabled={isSaving}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value as 'user' | 'admin')}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button disabled={!canSubmit || isSubmitting || isSaving} type="submit">
                  <UserPlus />
                  {isSaving ? 'Creating...' : 'Create'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>

        {provisionError ? <p className="mt-4 text-sm text-destructive">{provisionError}</p> : null}
        <ProvisionResult result={provisionMutation.data} />
      </CardContent>
    </Card>
  )
}
