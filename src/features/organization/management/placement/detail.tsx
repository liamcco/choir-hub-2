'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import { listChoirs, listSections } from '@/core/topology'
import { isFineVoice } from '@/core/types'
import { formatFineGrainedPlacementName } from '@/features/organization/core/labels'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { Button, buttonVariants } from '@/shared/ui/button'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { transferPlacementAction, updatePlacementStatusAction } from './actions'

type Detail = NonNullable<Awaited<ReturnType<typeof import('./query').getPlacementDetail>>>
type ActionState = { success?: boolean; message?: string } | null

export function PlacementDetail({ detail }: { detail: Detail }) {
  const [editingStatus, setEditingStatus] = useState(false)
  const [editingPlacement, setEditingPlacement] = useState(false)
  const [status, setStatus] = useState(detail.status)
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(
    (previous, formData) => updatePlacementStatusAction(detail.id, previous, formData),
    null,
  )
  const [transferState, transferAction, transferPending] = useActionState<ActionState, FormData>(
    transferPlacementAction,
    null,
  )
  useEffect(() => {
    if (statusState?.success) {
      setEditingStatus(false)
      setStatus(detail.status)
    }
  }, [detail.status, statusState?.success])
  useEffect(() => {
    if (transferState?.success) setEditingPlacement(false)
  }, [transferState?.success])
  const currentChoir = detail.currentChoir?.id ?? ''
  const currentSection = detail.currentSection?.id ?? ''
  const currentPlacement =
    detail.currentChoir && detail.voice && isFineVoice(detail.voice)
      ? formatFineGrainedPlacementName(detail.currentChoir.shortName, detail.voice)
      : detail.currentChoir
        ? 'No Section'
        : 'No Home Choir'
  return (
    <article className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold">{detail.name}</h2>
          <Link className={buttonVariants({ variant: 'outline' })} href={adminUserPath(detail.id)}>
            Edit user details
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{detail.email}</p>
      </div>
      <section className="space-y-4 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Member Status</p>
            <p className="font-medium">{formatMemberStatus(detail.status)}</p>
          </div>
          <Button onClick={() => setEditingStatus((current) => !current)} type="button" variant="outline">
            {editingStatus ? 'Cancel' : 'Change status'}
          </Button>
        </div>
        {editingStatus ? (
          <form action={statusAction} className="space-y-3 border-t pt-4">
            <FieldLabel htmlFor="placement-status">New Member Status</FieldLabel>
            <div className="flex gap-2">
              <Select
                name="status"
                value={status}
                onValueChange={(value) => value && setStatus(value as typeof status)}
              >
                <SelectTrigger id="placement-status" className="w-full">
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
              <Button disabled={statusPending} type="submit">
                Save status
              </Button>
            </div>
            {statusState?.message ? <p className="text-sm text-muted-foreground">{statusState.message}</p> : null}
          </form>
        ) : null}
      </section>
      {editingPlacement ? (
        <TransferForm
          detail={detail}
          allSections={listSections()}
          action={transferAction}
          pending={transferPending}
          state={transferState}
          choirs={listChoirs()}
          currentChoir={currentChoir}
          currentSection={currentSection}
          onCancel={() => setEditingPlacement(false)}
        />
      ) : (
        <section className="space-y-4 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Current placement</p>
              <p className="font-medium">{currentPlacement}</p>
            </div>
            <Button onClick={() => setEditingPlacement(true)} type="button" variant="outline">
              Transfer
            </Button>
          </div>
        </section>
      )}
      <section className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">History</h3>
        {detail.history.length ? (
          <div className="divide-y rounded-xl border">
            {detail.history.map((entry, index) => (
              <div
                className="flex justify-between gap-4 px-4 py-3 text-sm"
                key={`${entry.kind}-${entry.startsAt.toISOString()}-${index}`}
              >
                <span>
                  {entry.kind}: {entry.label}
                </span>
                <span className="text-muted-foreground">
                  {entry.startsAt.toLocaleDateString()} – {entry.endsAt?.toLocaleDateString() ?? 'Current'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No previous placement history.</p>
        )}
      </section>
    </article>
  )
}

function TransferForm({
  detail,
  allSections,
  action,
  pending,
  state,
  choirs,
  currentChoir,
  currentSection,
  onCancel,
}: {
  detail: Detail
  allSections: ReturnType<typeof listSections>
  action: (formData: FormData) => void | Promise<void>
  pending: boolean
  state: ActionState
  choirs: ReturnType<typeof listChoirs>
  currentChoir: string
  currentSection: string
  onCancel: () => void
}) {
  const [choirId, setChoirId] = useState(currentChoir)
  const [sectionId, setSectionId] = useState(currentSection)
  const sections = allSections.filter((section) => section.choirId === choirId)
  const selectedSection = sections.find((section) => section.id === sectionId)
  const voices = selectedSection?.allowedVoices ?? []
  return (
    <form action={action} className="space-y-4 rounded-xl border p-4">
      <h3 className="font-heading text-lg font-semibold">Transfer</h3>
      <input name="userId" type="hidden" value={detail.id} />
      <Field>
        <FieldLabel htmlFor="transfer-choir">Home Choir</FieldLabel>
        <Select
          name="choirId"
          value={choirId}
          onValueChange={(value) => {
            setChoirId(value ?? '')
            setSectionId('')
          }}
        >
          <SelectTrigger id="transfer-choir" className="w-full">
            <SelectValue placeholder="Choose Choir" />
          </SelectTrigger>
          <SelectContent>
            {choirs.map((choir) => (
              <SelectItem key={choir.id} value={choir.id}>
                {choir.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="transfer-section">Section</FieldLabel>
        <Select name="sectionId" value={sectionId} onValueChange={(value) => setSectionId(value ?? '')} key={choirId}>
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
      {voices.length > 1 ? (
        <Field>
          <FieldLabel htmlFor="transfer-voice">Voice</FieldLabel>
          <Select
            name="voice"
            defaultValue={
              detail.voice && isFineVoice(detail.voice) && voices.includes(detail.voice) ? detail.voice : ''
            }
            key={`${choirId}-${sectionId}`}
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
      ) : voices.length === 1 ? (
        <input name="voice" type="hidden" value={voices[0]} />
      ) : null}
      <div className="flex items-center gap-2">
        <Button disabled={pending} type="submit">
          Transfer
        </Button>
        <Button disabled={pending} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      </div>
      {state?.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
    </form>
  )
}
