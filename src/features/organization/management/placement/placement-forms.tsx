'use client'

import { useSelector } from '@tanstack/react-form-nextjs'
import { useActionState, useEffect } from 'react'
import { type ChoirId, listChoirs, listSections, resolveChoir, type SectionId } from '@/core/topology'
import type { FineVoice } from '@/core/types/voice'
import type { MemberStatus } from '@/drizzle/schema'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { FormMessageAlert } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { transferPlacementAction, updatePlacementStatusAction } from './actions'
import { PlacementStatusFormSchema, TransferPlacementFormSchema } from './schemas'

export function PlacementStatusForm({
  userId,
  initialStatus,
  onSuccess,
}: {
  userId: string
  initialStatus: MemberStatus
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(updatePlacementStatusAction.bind(null, userId), {})
  const form = useServerActionForm({
    schema: PlacementStatusFormSchema,
    defaultValues: { status: initialStatus },
    state,
  })

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [onSuccess, state?.success])

  return (
    <form action={formAction} onSubmit={() => form.handleSubmit()} noValidate className="space-y-3 border-t pt-4">
      <form.Field name="status">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="placement-status">New Member Status</FieldLabel>
              <div className="flex gap-2">
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => value && field.handleChange(value)}
                >
                  <SelectTrigger id="placement-status" className="w-full" aria-invalid={isInvalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['ACTIVE', 'PASSIVE', 'FORMER'] as const).map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatMemberStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button disabled={isPending || form.state.isSubmitting} type="submit">
                  {isPending ? 'Saving status' : 'Save status'}
                </Button>
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <FormMessageAlert state={state} />
    </form>
  )
}

export function TransferPlacementForm({
  userId,
  currentChoir,
  currentSection,
  currentVoice,
  onCancel,
  onSuccess,
}: {
  userId: string
  currentChoir?: ChoirId
  currentSection?: SectionId
  currentVoice?: FineVoice
  onCancel: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(transferPlacementAction, {})
  const form = useServerActionForm({
    schema: TransferPlacementFormSchema,
    defaultValues: {
      userId,
      choirId: currentChoir ?? '',
      sectionId: currentSection ?? 'none',
      voice: currentVoice,
    },
    state,
  })
  const values = useSelector(form.store, (formState) => formState.values)

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [onSuccess, state?.success])

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="space-y-4 rounded-xl border p-4"
    >
      <h3 className="font-heading text-lg font-semibold">Transfer</h3>
      <input name="userId" type="hidden" value={userId} />
      <form.Field name="choirId">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="transfer-choir">Home Choir</FieldLabel>
              <Select
                name={field.name}
                value={field.state.value}
                itemToStringLabel={(value) => resolveChoir(value)?.shortName ?? ''}
                onValueChange={(value) => {
                  field.handleChange(value ? (resolveChoir(value)?.id ?? '') : '')
                  form.setFieldValue('sectionId', 'none')
                  form.setFieldValue('voice', undefined)
                }}
              >
                <SelectTrigger id="transfer-choir" className="w-full" aria-invalid={isInvalid}>
                  <SelectValue placeholder="Choose Choir" />
                </SelectTrigger>
                <SelectContent>
                  {listChoirs().map((choir) => (
                    <SelectItem key={choir.id} value={choir.id}>
                      {choir.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="sectionId">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          const placementChoices = getPlacementChoices(values.choirId)
          const selectedPlacement = getPlacementChoiceValue(field.state.value, values.voice, placementChoices)
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="transfer-placement">Section</FieldLabel>
              <Select
                value={selectedPlacement}
                itemToStringLabel={(value) =>
                  value === 'none'
                    ? 'No Section for now'
                    : (placementChoices.find((choice) => choice.value === value)?.voice ?? '')
                }
                onValueChange={(value) => {
                  const choice = placementChoices.find((candidate) => candidate.value === value)
                  field.handleChange(choice?.sectionId ?? 'none')
                  form.setFieldValue('voice', choice?.voice)
                }}
                key={values.choirId}
              >
                <SelectTrigger id="transfer-placement" className="w-full" aria-invalid={isInvalid}>
                  <SelectValue placeholder="Choose Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Section for now</SelectItem>
                  {placementChoices.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input name="sectionId" type="hidden" value={field.state.value === 'none' ? '' : field.state.value} />
              <input name="voice" type="hidden" value={values.voice ?? ''} />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      {values.choirId && (!values.sectionId || values.sectionId === 'none') ? (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertDescription>
            No section is selected. This will transfer the User to the Choir without a Section Placement; you can assign
            a section later.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-center gap-2">
        <Button disabled={isPending || form.state.isSubmitting} type="submit">
          {isPending ? 'Transferring' : 'Transfer'}
        </Button>
        <Button disabled={isPending} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      </div>
      <FormMessageAlert state={state} />
    </form>
  )
}

function getSectionsForChoir(choirId: ChoirId | '') {
  return listSections().filter((section) => section.choirId === choirId)
}

function getPlacementChoices(choirId: ChoirId | '') {
  return getSectionsForChoir(choirId).flatMap((section) =>
    section.allowedVoices.map((voice) => ({
      value: `${section.id}:${voice}`,
      sectionId: section.id,
      voice,
    })),
  )
}

function getPlacementChoiceValue(
  sectionId: SectionId | '' | 'none' | undefined,
  voice: FineVoice | '' | undefined,
  choices: ReturnType<typeof getPlacementChoices>,
) {
  if (!sectionId || sectionId === 'none') return 'none'
  return choices.find((choice) => choice.sectionId === sectionId && choice.voice === voice)?.value ?? ''
}
