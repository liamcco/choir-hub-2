'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'

import { createGroupKindMutation, deleteGroupKindMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { createGroupKindSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import z from 'zod'

const defaultGroupKindFormValues: z.input<typeof createGroupKindSchema> = {
  name: '',
  description: '',
}

export function GroupKindsAdmin({
  groupKinds,
  groups,
  isPending,
  error,
  onKindsChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  isPending: boolean
  error: unknown
  onKindsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <CreateGroupKindCard onChanged={onKindsChanged} />
      <GroupKindsTable
        groupKinds={groupKinds}
        groups={groups}
        isPending={isPending}
        error={error}
        onChanged={onKindsChanged}
      />
    </div>
  )
}

function CreateGroupKindCard({ onChanged }: { onChanged: () => Promise<unknown> }) {
  const mutation = useMutation(createGroupKindMutation())
  const form = useForm({
    defaultValues: defaultGroupKindFormValues,
    validators: {
      onSubmit: createGroupKindSchema,
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
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    disabled={isSaving}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description optional</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ''}
                    disabled={isSaving}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
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

function GroupKindsTable({
  groupKinds,
  groups,
  isPending,
  error,
  onChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const deleteMutation = useMutation(deleteGroupKindMutation())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Kinds</CardTitle>
        <CardDescription>{groupKinds.length} configured</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : getErrorMessage(error) ? (
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        ) : (
          <>
            <Table className="min-w-120">
              <TableHeader className="text-xs text-muted-foreground uppercase">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupKinds.map((kind) => {
                  const usedByCount = groups.filter((group) => group.kindId === kind.id).length

                  return (
                    <TableRow key={kind.id}>
                      <TableCell className="font-medium">{kind.name}</TableCell>
                      <TableCell className="text-muted-foreground">{usedByCount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          title="Delete kind"
                          aria-label="Delete kind"
                          disabled={deleteMutation.isPending || usedByCount > 0}
                          onClick={async () => {
                            await deleteMutation.mutateAsync({ path: { id: kind.id } })
                            await onChanged()
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <FormError error={getErrorMessage(deleteMutation.error)} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
