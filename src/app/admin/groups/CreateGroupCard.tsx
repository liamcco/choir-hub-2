'use client'

import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { FormEvent, useState } from 'react'

import { createGroupMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { createGroupSchema } from '@/api/models/groups'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError, selectClassName } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function CreateGroupCard({
  groupKinds,
  groups,
  onChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: (createdGroupId: string) => Promise<unknown>
}) {
  const mutation = useMutation(createGroupMutation())
  const [active, setActive] = useState(true)
  const [isContainer, setIsContainer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const parentGroupId = String(formData.get('parentGroupId') ?? '')
    const parsed = createGroupSchema.safeParse({
      kindId: String(formData.get('kindId') ?? ''),
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
      active,
      isContainer,
      parentGroupId: parentGroupId || null,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid group')
      return
    }

    try {
      const createdGroup = await mutation.mutateAsync({ body: parsed.data })
      form.reset()
      setActive(true)
      setIsContainer(false)
      await onChanged(createdGroup.id)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group</CardTitle>
        <CardDescription>Add a group to the choir hierarchy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="group-kind">Kind</FieldLabel>
              <select id="group-kind" name="kindId" className={selectClassName} disabled={mutation.isPending}>
                <option value="">Select kind</option>
                {groupKinds.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="group-name">Name</FieldLabel>
              <Input id="group-name" name="name" disabled={mutation.isPending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="group-description">Description optional</FieldLabel>
              <Input id="group-description" name="description" disabled={mutation.isPending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="group-parent">Parent optional</FieldLabel>
              <select id="group-parent" name="parentGroupId" className={selectClassName} disabled={mutation.isPending}>
                <option value="">Root group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={active}
                  disabled={mutation.isPending}
                  onCheckedChange={(checked) => setActive(checked === true)}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isContainer}
                  disabled={mutation.isPending}
                  onCheckedChange={(checked) => setIsContainer(checked === true)}
                />
                Container
              </label>
            </div>
            <Button type="submit" disabled={mutation.isPending || groupKinds.length === 0}>
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
