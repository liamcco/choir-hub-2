'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Trash2, UserPlus } from 'lucide-react'

import {
  createGroupMembershipMutation,
  deleteGroupMembershipMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { createMembershipFormSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, Person } from '@/common/groups/types'
import { formatDate, personLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import z from 'zod'

const defaultMembershipFormValues: z.input<typeof createMembershipFormSchema> = {
  personId: '',
}

export function MembershipsAdmin({
  group,
  people,
  members,
  isPending,
  error,
  onMembershipsChanged,
}: {
  group: Group | null
  people: Person[]
  members: Membership[]
  isPending: boolean
  error: unknown
  onMembershipsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <AddMembershipCard group={group} people={people} memberships={members} onChanged={onMembershipsChanged} />
      <MembershipsTable
        group={group}
        members={members}
        people={people}
        isPending={isPending}
        error={error}
        onChanged={onMembershipsChanged}
      />
    </div>
  )
}

function AddMembershipCard({
  group,
  people,
  memberships,
  onChanged,
}: {
  group: Group | null
  people: Person[]
  memberships: Membership[]
  onChanged: () => Promise<unknown>
}) {
  const mutation = useMutation(createGroupMembershipMutation())
  const memberPersonIds = new Set(memberships.map((membership) => membership.userId))
  const availablePeople = people.filter((person) => !memberPersonIds.has(person.id))
  const form = useForm({
    defaultValues: defaultMembershipFormValues,
    validators: {
      onSubmit: createMembershipFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!group) {
        return
      }

      try {
        await mutation.mutateAsync({ path: { id: group.id }, body: value })
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
            <form.Field name="personId">
              {(field) => (
                <ControlledFieldSelect
                  id={field.name}
                  label="Person"
                  items={availablePeople}
                  getValue={(person) => person.id}
                  getLabel={personLabel}
                  placeholder="Select person"
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
                    !group ||
                    group.isContainer ||
                    !canSubmit ||
                    isSubmitting ||
                    isSaving ||
                    availablePeople.length === 0
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
  people,
  isPending,
  error,
  onChanged,
}: {
  group: Group | null
  members: Membership[]
  people: Person[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const deleteMutation = useMutation(deleteGroupMembershipMutation())
  const peopleById = new Map(people.map((person) => [person.id, person]))

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
                  <TableHead>Person</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell className="font-medium">{personLabel(peopleById.get(member.userId))}</TableCell>
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

                          await deleteMutation.mutateAsync({ path: { id: group.id, userId: member.userId } })
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
