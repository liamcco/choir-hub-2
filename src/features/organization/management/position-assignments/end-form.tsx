'use client'

import { SaveIcon } from 'lucide-react'
import { useActionState } from 'react'
import { formatDateInput } from '@/shared/formatting'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Button } from '@/shared/ui/button'
import { FieldError } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { endPositionAssignmentAction } from './actions'
import { EndPositionAssignmentFormSchema } from './schemas'

type PositionAssignmentToEnd = { id: string; userId: string; startsAt: Date; userLabel: string }

export function EndPositionAssignmentForm({
  assignment,
  immediate = false,
}: {
  assignment: PositionAssignmentToEnd & { position: { name: string } }
  immediate?: boolean
}) {
  const [state, formAction, isPending] = useActionState(endPositionAssignmentAction.bind(null, assignment.id), {})
  const form = useServerActionForm({
    schema: EndPositionAssignmentFormSchema,
    defaultValues: { endsAt: immediate ? formatDateInput(new Date()) : '' },
    state,
  })

  if (immediate) {
    return (
      <form
        action={formAction}
        onSubmit={() => form.handleSubmit()}
        noValidate
        className="flex flex-col items-end gap-1"
      >
        <input name="endsAt" type="hidden" value={form.state.values.endsAt} />
        <input name="userId" type="hidden" value={assignment.userId} />
        <Button type="submit" variant="outline" disabled={isPending || form.state.isSubmitting}>
          {isPending ? 'Ending' : 'End'}
        </Button>
        <FormMessageToast state={state} />
      </form>
    )
  }

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="flex min-w-44 items-start justify-end gap-2"
    >
      <input name="userId" type="hidden" value={assignment.userId} />
      <form.Field name="endsAt">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <div className="flex flex-col gap-1">
              <Input
                name={field.name}
                type="date"
                min={formatDateInput(assignment.startsAt)}
                aria-label={`End ${assignment.userLabel} assignment to ${assignment.position.name}`}
                aria-invalid={isInvalid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
              <FormMessageToast state={state} />
            </div>
          )
        }}
      </form.Field>
      <Button
        type="submit"
        variant="outline"
        size="icon-sm"
        aria-label="Save end date"
        disabled={isPending || form.state.isSubmitting}
      >
        <SaveIcon />
      </Button>
    </form>
  )
}
