'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Check, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { deleteGroupMutation, updateGroupMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { updateGroupRequestSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { useRouter } from 'next/navigation'
import { GroupFormFields } from '../_components/GroupFormFields'

export function GroupSettingsCard({
  group,
  groupKinds,
  groups,
  onChanged,
}: {
  group: Group | null
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: () => Promise<unknown>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Group</CardTitle>
        <CardDescription>{group ? group.name : 'Select a group to edit'}</CardDescription>
      </CardHeader>
      <CardContent>
        {group ? (
          <GroupSettingsForm
            key={group.id}
            group={group}
            groupKinds={groupKinds}
            groups={groups}
            onChanged={onChanged}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No group selected.</p>
        )}
      </CardContent>
    </Card>
  )
}

function GroupSettingsForm({
  group,
  groupKinds,
  groups,
  onChanged,
}: {
  group: Group
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: () => Promise<unknown>
}) {
  const router = useRouter()
  const updateMutation = useMutation(updateGroupMutation())
  const deleteMutation = useMutation(deleteGroupMutation())
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      kindId: group.kindId,
      name: group.name,
      description: group.description,
      isContainer: group.isContainer,
      parentGroupId: group.parentGroupId,
    },
    validators: {
      onSubmit: updateGroupRequestSchema.required(),
    },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        await updateMutation.mutateAsync({
          path: { groupId: group.id },
          body: {
            ...value,
            description: value.description || null,
            parentGroupId: value.parentGroupId || null,
          },
        })
        await onChanged()
      } catch (submitError) {
        setError(getErrorMessage(submitError))
      }
    },
  })

  const isSaving = updateMutation.isPending || form.state.isSubmitting

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <GroupFormFields
            excludedParentGroupId={group.id}
            form={form}
            groupKinds={groupKinds}
            groups={groups}
            isSaving={isSaving}
          />
          <div className="flex flex-wrap gap-2">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isSaving}>
                  <Check />
                  Save
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                try {
                  setError(null)
                  await deleteMutation.mutateAsync({ path: { groupId: group.id } })
                  router.push('/admin/groups')
                } catch (submitError) {
                  setError(getErrorMessage(submitError))
                }
              }}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </FieldGroup>
      </form>
      <FormError error={error ?? getErrorMessage(updateMutation.error) ?? getErrorMessage(deleteMutation.error)} />
    </>
  )
}
