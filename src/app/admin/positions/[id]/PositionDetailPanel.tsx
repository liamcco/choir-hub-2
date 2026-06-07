'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { DataState } from '@/app/admin/_components/data-state'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Position, User } from '@/common/groups/types'
import { groupSectionsByKind } from '@/common/groups/utils'
import { FormError, FormTextInput } from '@/common/ui/form'
import { ControlledMemberCombobox } from '@/components/forms/member-combobox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  deletePositionMutation,
  getGroupsOptions,
  getPositionByIdOptions,
  getPositionByIdQueryKey,
  getPositionsQueryKey,
  getUsersOptions,
  updatePositionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

const positionDetailFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim(),
  groupIds: z.array(z.string().min(1)).min(1, 'At least one group is required'),
  currentHolderUserId: z.string().min(1).nullable(),
  heldSince: z.string(),
})

export function PositionDetailPanel({ positionId }: { positionId: string }) {
  const queryClient = useQueryClient()
  const positionQuery = useQuery(getPositionByIdOptions({ path: { positionId } }))
  const groupsQuery = useQuery(getGroupsOptions())
  const usersQuery = useQuery(getUsersOptions())

  const invalidatePositions = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getPositionsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getPositionByIdQueryKey({ path: { positionId } }) }),
    ])

  return (
    <DataState
      isPending={positionQuery.isPending || groupsQuery.isPending || usersQuery.isPending}
      error={positionQuery.error ?? groupsQuery.error ?? usersQuery.error}
    >
      <PositionDetailCard
        key={positionQuery.data?.id}
        position={positionQuery.data}
        groups={groupsQuery.data ?? []}
        users={usersQuery.data ?? []}
        onChanged={invalidatePositions}
      />
    </DataState>
  )
}

function PositionDetailCard({
  position,
  groups,
  users,
  onChanged,
}: {
  position: Position | undefined
  groups: Group[]
  users: User[]
  onChanged: () => Promise<unknown>
}) {
  const router = useRouter()
  const updateMutation = useMutation(updatePositionMutation())
  const deleteMutation = useMutation(deletePositionMutation())
  const groupSections = groupSectionsByKind(groups)

  const form = useForm({
    defaultValues: {
      name: position?.name ?? '',
      description: position?.description ?? '',
      groupIds: position?.groupIds ?? [],
      currentHolderUserId: position?.currentHolder?.id ?? null,
      heldSince: toDateInputValue(position?.heldSince),
    },
    validators: {
      onSubmit: positionDetailFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!position) {
        return
      }

      const parsed = positionDetailFormSchema.safeParse(value)

      if (!parsed.success) {
        return
      }

      await updateMutation.mutateAsync({
        path: { positionId: position.id },
        body: {
          name: parsed.data.name.trim(),
          description: parsed.data.description.trim() || null,
          groupIds: parsed.data.groupIds,
          currentHolderUserId: parsed.data.currentHolderUserId,
          heldSince: parsed.data.currentHolderUserId ? parsed.data.heldSince || null : null,
        },
      })
      await onChanged()
    },
  })

  const isSaving = updateMutation.isPending || form.state.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>{position?.name ?? 'Position'}</CardTitle>
        <CardDescription>Edit the position record and its active assignment.</CardDescription>
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
                <Field>
                  <FieldLabel htmlFor={field.name}>Description optional</FieldLabel>
                  <Textarea
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
            <form.Field name="groupIds">
              {(field) => (
                <Field>
                  <FieldLabel>Groups</FieldLabel>
                  <FieldDescription>Choose every group this position belongs to.</FieldDescription>
                  <div className="grid gap-4 md:grid-cols-2">
                    {groupSections.map((section) => (
                      <div key={section.key} className="space-y-2">
                        <p className="text-sm font-medium">{section.label}</p>
                        <div className="space-y-2">
                          {section.items.map((group) => (
                            <label key={group.id} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={field.state.value.includes(group.id)}
                                disabled={isSaving}
                                onCheckedChange={(checked) => {
                                  field.handleChange(toggleGroupId(field.state.value, group.id, checked === true))
                                }}
                              />
                              {group.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>
            <form.Field name="currentHolderUserId">
              {(field) => (
                <ControlledMemberCombobox
                  id={field.name}
                  label="Holder optional"
                  users={users}
                  placeholder="Search members"
                  value={field.state.value ?? ''}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => field.handleChange(value || null)}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
              )}
            </form.Field>
            <form.Field name="heldSince">
              {(field) => (
                <FormTextInput
                  id={field.name}
                  label="Held since optional"
                  type="date"
                  value={field.state.value ?? ''}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
              )}
            </form.Field>
            <div className="flex flex-wrap gap-2">
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!position || !canSubmit || isSubmitting || isSaving}>
                    <Check />
                    Save
                  </Button>
                )}
              </form.Subscribe>
              <Button
                type="button"
                variant="destructive"
                disabled={!position || deleteMutation.isPending}
                onClick={async () => {
                  if (!position) {
                    return
                  }

                  await deleteMutation.mutateAsync({ path: { positionId: position.id } })
                  await onChanged()
                  router.push('/admin/positions')
                }}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </FieldGroup>
        </form>
        <FormError error={getErrorMessage(updateMutation.error) ?? getErrorMessage(deleteMutation.error)} />
      </CardContent>
    </Card>
  )
}

function toggleGroupId(groupIds: string[], groupId: string, isSelected: boolean) {
  if (isSelected) {
    return groupIds.includes(groupId) ? groupIds : [...groupIds, groupId]
  }

  return groupIds.filter((id) => id !== groupId)
}

function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}
