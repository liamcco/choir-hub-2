'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createGroupMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { createGroupFormSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import z from 'zod'
import { GroupFormFields } from '../_components/GroupFormFields'

const defaultGroupFormValues: z.input<typeof createGroupFormSchema> = {
  kindId: '',
  name: '',
  description: '',
  isContainer: false,
  parentGroupId: null,
}

export function CreateGroupCard({
  groupKinds,
  groups,
  onChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: (createdGroupId: string) => Promise<unknown>
}) {
  const router = useRouter()
  const mutation = useMutation(createGroupMutation())
  const form = useForm({
    defaultValues: defaultGroupFormValues,
    validators: {
      onSubmit: createGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const createdGroup = await mutation.mutateAsync({
          body: {
            kindId: value.kindId,
            name: value.name.trim(),
            description: value.description?.trim() || undefined,
            isContainer: value.isContainer,
            parentGroupId: value.parentGroupId || null,
          },
        })
        router.push(`/admin/groups/${createdGroup.id}`)
        form.reset()
        await onChanged(createdGroup.id)
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = mutation.isPending || form.state.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group</CardTitle>
        <CardDescription>Add a group to the choir hierarchy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <GroupFormFields form={form} groupKinds={groupKinds} groups={groups} isSaving={isSaving} />
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isSaving || groupKinds.length === 0}>
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
