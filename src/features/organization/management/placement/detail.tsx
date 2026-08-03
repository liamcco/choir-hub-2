'use client'

import Link from 'next/link'
import { useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import { isFineVoice } from '@/core/types'
import { formatFineGrainedPlacementName } from '@/features/organization/core/labels'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { Button, buttonVariants } from '@/shared/ui/button'
import { PlacementStatusForm, TransferPlacementForm } from './placement-forms'
import type { PlacementDetail as Detail } from './query'

export function PlacementDetail({ detail }: { detail: Detail }) {
  const [editingStatus, setEditingStatus] = useState(false)
  const [editingPlacement, setEditingPlacement] = useState(false)
  const currentChoir = detail.currentChoir?.id
  const currentSection = detail.currentSection?.id
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
          <PlacementStatusForm
            userId={detail.id}
            initialStatus={detail.status}
            onSuccess={() => setEditingStatus(false)}
          />
        ) : null}
      </section>
      {editingPlacement ? (
        <TransferPlacementForm
          userId={detail.id}
          currentChoir={currentChoir}
          currentSection={currentSection}
          currentVoice={detail.voice && isFineVoice(detail.voice) ? detail.voice : undefined}
          onCancel={() => setEditingPlacement(false)}
          onSuccess={() => setEditingPlacement(false)}
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
