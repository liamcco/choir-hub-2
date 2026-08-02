'use client'

import { useStore } from '@tanstack/react-form-nextjs'
import { useActionState, useEffect } from 'react'
import { listChoirs, listSections } from '@/core/topology'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { FormMessageAlert } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { transferPlacementAction, updatePlacementStatusAction } from './actions'
import { PlacementStatusFormSchema, TransferPlacementFormSchema } from './schemas'

export type PlacementActionState = { success?: boolean; message?: string } | null

export function PlacementStatusForm({
  userId,
  initialStatus,
  onSuccess,
}: {
  userId: string
  initialStatus: 'ACTIVE' | 'PASSIVE' | 'FORMER'
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState<PlacementActionState, FormData>(
    (previous, formData) => updatePlacementStatusAction(userId, previous, formData),
    null,
  )
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
      <FormMessageAlert state={state ?? {}} />
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
  currentChoir: string
  currentSection: string
  currentVoice?: string
  onCancel: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState<PlacementActionState, FormData>(transferPlacementAction, null)
  const form = useServerActionForm({
    schema: TransferPlacementFormSchema,
    defaultValues: {
      userId,
      choirId: currentChoir,
      sectionId: currentSection,
      voice: currentVoice ?? '',
    },
    state,
  })
  const values = useStore(form.store, (formState) => formState.values)
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
                  field.handleChange(value ?? '')
                  form.setFieldValue('sectionId', '')
                  form.setFieldValue('voice', '')
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
        {(field) => (
          <Field>
            <FieldLabel htmlFor="transfer-section">Section</FieldLabel>
            <Select
              name={field.name}
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value ?? '')
                form.setFieldValue('voice', '')
              }}
              key={values.choirId}
            >
              <SelectTrigger id="transfer-section" className="w-full">
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
          </Field>
        )}
      </form.Field>
      {voices.length > 1 ? (
        <form.Field name="voice">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="transfer-voice">Voice</FieldLabel>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? '')}
              >
                <SelectTrigger id="transfer-voice" className="w-full">
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
            </Field>
          )}
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
      <FormMessageAlert state={state ?? {}} />
    </form>
  )
}

function getSectionsForChoir(choirId: string) {
  return listSections().filter((section) => section.choirId === choirId)
}

function getVoicesForSection(sectionId: string) {
  return listSections().find((section) => section.id === sectionId)?.allowedVoices ?? []
}
