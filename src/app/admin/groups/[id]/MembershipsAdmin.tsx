'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Trash2, UserPlus } from 'lucide-react'

import { addUserToGroupMutation, deleteGroupMembershipMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { addUserToGroupRequestSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, User } from '@/common/groups/types'
import { formatDate, userLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
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
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <AddMembershipCard group={group} users={users} memberships={members} onChanged={onMembershipsChanged} />
      <MembershipsTable
        group={group}
        members={members}
        users={users}
        isPending={isPending}
        error={error}
        onChanged={onMembershipsChanged}
      />
    </div>
  )
}

function AddMembershipCard({
  group,
  users,
  memberships,
  onChanged,
}: {
  group: Group | null
  users: User[]
  memberships: Membership[]
  onChanged: () => Promise<unknown>
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
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = mutation.isPending || form.state.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Member</CardTitle>
        <CardDescription>
          {group?.isContainer ? 'Container groups reject direct memberships.' : group?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="userId">
              {(field) => (
                <ControlledFieldSelect
                  id={field.name}
                  label="User"
                  items={availableUsers}
                  getValue={(user) => user.id}
                  getLabel={userLabel}
                  placeholder="Select user"
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
      </CardContent>
    </Card>
  )
}

function MembershipsTable({
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
  const deleteMutation = useMutation(deleteGroupMembershipMutation())
  const usersById = new Map(users.map((user) => [user.id, user]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memberships</CardTitle>
        <CardDescription>
          {members.filter((x) => x.isDirect).length} direct / {members.filter((x) => !x.isDirect).length} effective
        </CardDescription>
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
            {!members.length ? <p className="text-sm text-muted-foreground">No direct memberships.</p> : null}
            <FormError error={getErrorMessage(deleteMutation.error)} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
