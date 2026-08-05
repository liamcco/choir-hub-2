import 'server-only'

import { isNull } from 'drizzle-orm'
import { db } from '@/core/db'
import { listChoirsInDisplayOrder, listSections, topology } from '@/core/topology'
import { isFineVoice } from '@/core/types'
import { choirMembership, type MemberStatus, sectionPlacement } from '@/drizzle/schema'
import { organizationService } from '@/features/organization'
import { buildUserDisplayOptions, formatFineGrainedPlacementName } from '@/features/organization/core/labels'

export type PlacementUser = {
  id: string
  name: string
  email: string
  status: MemberStatus
  choirId: string | null
  sectionId: string | null
  voice: string | null
}

export async function listPlacementUsers() {
  const [users, memberships, placements] = await Promise.all([
    organizationService.users.list(),
    db.select().from(choirMembership).where(isNull(choirMembership.endsAt)),
    db.select().from(sectionPlacement).where(isNull(sectionPlacement.endsAt)),
  ])
  const choirByUser = new Map(memberships.map((item) => [item.userId, item.choirId]))
  const placementByUser = new Map(placements.map((item) => [item.userId, item]))
  return buildUserDisplayOptions(users).map(({ user: item, label, detail }) => {
    const placement = placementByUser.get(item.id)
    return {
      id: item.id,
      name: label,
      email: detail,
      status: item.status,
      choirId: choirByUser.get(item.id) ?? null,
      sectionId: placement?.sectionId ?? null,
      voice: placement?.voice ?? null,
    }
  })
}

export async function getPlacementDetail(userId: string) {
  const users = await listPlacementUsers()
  const item = users.find((candidate) => candidate.id === userId)
  if (!item) return null
  const [currentMemberships, currentPlacements, previousPlacements] = await Promise.all([
    organizationService.homePlacement.listChoirMemberships({ userId }),
    organizationService.homePlacement.listSectionPlacements({ userId }),
    organizationService.homePlacement.listPreviousSectionPlacements({ userId }),
  ])
  const choirs = new Map<string, (typeof topology.choirs)[number]>(topology.choirs.map((entry) => [entry.id, entry]))
  const sections = new Map<string, (typeof topology.sections)[number]>(
    topology.sections.map((entry) => [entry.id, entry]),
  )
  return {
    ...item,
    currentChoir: currentMemberships[0] ? (choirs.get(currentMemberships[0].choirId) ?? null) : null,
    currentSection: currentPlacements[0] ? (sections.get(currentPlacements[0].sectionId) ?? null) : null,
    currentPlacementStartsAt: currentPlacements[0]?.startsAt ?? currentMemberships[0]?.startsAt ?? null,
    history: previousPlacements
      .map((entry) => {
        const section = sections.get(entry.sectionId)
        const choir = section ? choirs.get(section.choirId) : undefined
        return {
          label:
            choir && isFineVoice(entry.voice)
              ? formatFineGrainedPlacementName(choir.shortName, entry.voice)
              : entry.sectionId,
          startsAt: entry.startsAt,
          endsAt: entry.endsAt,
        }
      })
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime()),
  }
}

export type PlacementDetail = NonNullable<Awaited<ReturnType<typeof getPlacementDetail>>>

export function placementNavigation() {
  return listChoirsInDisplayOrder().map((choir) => ({
    choir,
    sections: listSections().filter((section) => section.choirId === choir.id),
  }))
}

export function placementLabels() {
  return { choirs: listChoirsInDisplayOrder(), sections: listSections() }
}
