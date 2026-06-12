'use client'

import { FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'

import {
  createGroupKindMutation,
  deleteGroupKindMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { createGroupKindSchema } from '@/api/models/groups'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { AsyncState } from '@/common/ui/async-state'
import { FormError } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

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
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const parsed = createGroupKindSchema.safeParse({
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid group kind')
      return
    }

    try {
      await mutation.mutateAsync({ body: parsed.data })
      form.reset()
      await onChanged()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Kind</CardTitle>
        <CardDescription>Add a controlled group classification.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="kind-name">Name</FieldLabel>
              <Input id="kind-name" name="name" disabled={mutation.isPending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="kind-description">Description optional</FieldLabel>
              <Input id="kind-description" name="description" disabled={mutation.isPending} />
            </Field>
            <Button type="submit" disabled={mutation.isPending}>
              <Plus />
              Create
            </Button>
          </FieldGroup>
        </form>
        <FormError error={error ?? getErrorMessage(mutation.error)} />
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
        <AsyncState isPending={isPending} error={error}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Used By</th>
                  <th className="py-2 pr-0 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {groupKinds.map((kind) => {
                  const usedByCount = groups.filter((group) => group.kindId === kind.id).length

                  return (
                    <tr key={kind.id}>
                      <td className="py-3 pr-4 font-medium">{kind.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{usedByCount}</td>
                      <td className="py-3 pr-0 text-right">
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <FormError error={getErrorMessage(deleteMutation.error)} />
        </AsyncState>
      </CardContent>
    </Card>
  )
}
