'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Trash2, UserPlus } from 'lucide-react'

import { addUserToGroupMutation, deleteGroupMembershipMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { addUserToGroupRequestSchema } from '@/api/models/group'
import { DataState, EmptyText } from '@/app/admin/_components/data-state'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, User } from '@/common/groups/types'
import { formatDate, userLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'
import { ControlledMemberCombobox } from '@/components/forms/member-combobox'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function MembershipsAdmin({
  group,
  users,
  members,
  isPending,
  error,
  onMembershipsChanged,
}: {
  group: Group | null
  users: User[]
  members: Membership[]
  isPending: boolean
  error: unknown
  onMembershipsChanged: () => Promise<unknown>
}) {
  return (
    <MembershipsCard
      group={group}
      members={members}
      users={users}
      isPending={isPending}
      error={error}
      onChanged={onMembershipsChanged}
    />
  )
}

function AddMembershipPanel({
  group,
  users,
  memberships,
  onChanged,
  onAdded,
}: {
  group: Group | null
  users: User[]
  memberships: Membership[]
  onChanged: () => Promise<unknown>
  onAdded: () => void
}) {
  const mutation = useMutation(addUserToGroupMutation())
  const memberUserIds = new Set(memberships.map((membership) => membership.userId))
  const availableUsers = users.filter((user) => !memberUserIds.has(user.id))
  const form = useForm({
    defaultValues: {
      userId: '',
    },
    validators: {
      onSubmit: addUserToGroupRequestSchema,
    },
    onSubmit: async ({ value }) => {
      if (!group) {
        return
      }

      try {
        await mutation.mutateAsync({ path: { groupId: group.id }, body: value })
        form.reset()
        await onChanged()
        onAdded()
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = mutation.isPending || form.state.isSubmitting

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field name="userId">
            {(field) => (
              <ControlledMemberCombobox
                id={field.name}
                label="User"
                users={availableUsers}
                placeholder={group?.isContainer ? 'Container group' : 'Select user'}
                value={field.state.value}
                disabled={!group || group.isContainer || isSaving}
                onBlur={field.handleBlur}
                onValueChange={(value) => field.handleChange(value)}
                errors={field.state.meta.isTouched ? field.state.meta.errors : []}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={
                  !group || group.isContainer || !canSubmit || isSubmitting || isSaving || availableUsers.length === 0
                }
              >
                <UserPlus />
                Add
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
      <FormError error={getErrorMessage(mutation.error)} />
    </div>
  )
}

function MembershipsCard({
  group,
  members,
  users,
  isPending,
  error,
  onChanged,
}: {
  group: Group | null
  members: Membership[]
  users: User[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const [isAdding, setIsAdding] = useState(false)
  const deleteMutation = useMutation(deleteGroupMembershipMutation())
  const usersById = new Map(users.map((user) => [user.id, user]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memberships</CardTitle>
        <CardDescription>
          {members.filter((x) => x.isDirect).length} direct / {members.filter((x) => !x.isDirect).length} effective
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant={isAdding ? 'outline' : 'default'}
            disabled={!group || group.isContainer}
            onClick={() => setIsAdding((current) => !current)}
          >
            <UserPlus />
            {isAdding ? 'Close' : 'Add member'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
          <>
            {isAdding ? (
              <div className="mb-4">
                <AddMembershipPanel
                  group={group}
                  users={users}
                  memberships={members}
                  onChanged={onChanged}
                  onAdded={() => setIsAdding(false)}
                />
              </div>
            ) : null}
            <Table className="min-w-130">
              <TableHeader className="text-xs text-muted-foreground uppercase">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell className="font-medium">{userLabel(usersById.get(member.userId))}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(member.addedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        title="Remove membership"
                        aria-label="Remove membership"
                        disabled={!group || deleteMutation.isPending}
                        onClick={async () => {
                          if (!group) {
                            return
                          }

                          await deleteMutation.mutateAsync({ path: { groupId: group.id, userId: member.userId } })
                          await onChanged()
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!members.length ? <EmptyText>No direct memberships.</EmptyText> : null}
            <FormError error={getErrorMessage(deleteMutation.error)} />
          </>
        </DataState>
      </CardContent>
    </Card>
  )
}
