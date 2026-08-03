'use client'

import { useSelector } from '@tanstack/react-form-nextjs'
import { useActionState, useEffect } from 'react'
import { type ChoirId, listChoirs, listSections, resolveChoir, resolveSection, type SectionId } from '@/core/topology'
import { type FineVoice, isFineVoice } from '@/core/types/voice'
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
  const sections = getSectionsForChoir(values.choirId)
  const voices = getVoicesForSection(values.sectionId)

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
                      {choir.name}
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
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="transfer-section">Section</FieldLabel>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value === 'none' ? 'none' : value ? (resolveSection(value)?.id ?? '') : '')
                  form.setFieldValue('voice', undefined)
                }}
                key={values.choirId}
              >
                <SelectTrigger id="transfer-section" className="w-full" aria-invalid={isInvalid}>
                  <SelectValue placeholder="No Section for now" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Section for now</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      {voices.length > 1 ? (
        <form.Field name="voice">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="transfer-voice">Voice</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value && isFineVoice(value) ? value : undefined)}
                >
                  <SelectTrigger id="transfer-voice" className="w-full" aria-invalid={isInvalid}>
                    <SelectValue placeholder="Choose Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      ) : voices.length === 1 ? (
        <input name="voice" type="hidden" value={voices[0]} />
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

function getVoicesForSection(sectionId: SectionId | '' | 'none' | undefined) {
  return sectionId && sectionId !== 'none' ? (resolveSection(sectionId)?.allowedVoices ?? []) : []
}
