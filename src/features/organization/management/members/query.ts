import 'server-only'

import { headers } from 'next/headers'
import { connection } from 'next/server'
import { auth } from '@/core/auth/auth'
import { listGroups, listPositions, topology } from '@/core/topology'
import { type FineVoice, isFineVoice, type Voice } from '@/core/types'
import { organizationService } from '@/features/organization'
import { isCurrentDatedPeriod } from '@/features/organization/core/dated-history'
import {
  buildUserLabels,
  formatFineGrainedPlacementName,
  formatGroupPath,
  formatPositionLabel,
  formatPositionScopeLabel,
} from '@/features/organization/core/labels'

async function listCollection(input?: { at?: Date }) {
  await connection()
  const at = input?.at ?? new Date()
  const [users, choirMemberships, placements] = await Promise.all([
    organizationService.users.list(),
    organizationService.homePlacement.listChoirMemberships(),
    organizationService.homePlacement.listSectionPlacements(),
  ])
  const choirById = new Map<string, (typeof topology.choirs)[number]>(topology.choirs.map((item) => [item.id, item]))

  return buildUserLabels(users)
    .map(({ user, label }) => {
      return {
        id: user.id,
        name: label,
        homeChoir:
          choirById.get(
            choirMemberships.find((m) => m.userId === user.id && isCurrentDatedPeriod(m, at))?.choirId ?? '',
          )?.shortName ?? null,
        voice: formatPlacementVoice(placements.find((p) => p.userId === user.id && isCurrentDatedPeriod(p, at))),
        status: user.status,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
}

async function getDetail(userId: string, input?: { at?: Date }) {
  await connection()
  const at = input?.at ?? new Date()
  const requestHeaders = await headers()
  const [account, user, memberships, assignments, choirMemberships, placements] = await Promise.all([
    auth.api.getUser({ headers: requestHeaders, query: { id: userId } }),
    organizationService.users.find({ userId }),
    organizationService.committeeMembership.list({ userId, at }),
    organizationService.positionAssignments.list({ userId, at }),
    organizationService.homePlacement.listChoirMemberships({ userId, at }),
    organizationService.homePlacement.listSectionPlacements({ userId, at }),
  ])
  if (!account || !user) return null

  const choirs = topology.choirs
  const sections = topology.sections
  const groups = topology.groups
  const positions = topology.positions
  const choirById = new Map<string, (typeof topology.choirs)[number]>(choirs.map((item) => [item.id, item]))
  const sectionById = new Map<string, (typeof topology.sections)[number]>(sections.map((item) => [item.id, item]))
  const currentChoir = choirMemberships.find((item) => isCurrentDatedPeriod(item, at))
  const currentSection = placements.find((item) => isCurrentDatedPeriod(item, at))

  const groupsById = new Map<string, (typeof topology.groups)[number]>(groups.map((group) => [group.id, group]))
  const positionsById = new Map<string, (typeof topology.positions)[number]>(
    positions.map((position) => [position.id, position]),
  )
  const membershipViews = memberships.flatMap((membership) => {
    const group = groupsById.get(membership.groupId)
    return group
      ? [
          {
            id: membership.id,
            groupId: group.id,
            groupName: formatGroupPath(groups, group),
            groupKind: group.kind,
            startsAt: membership.startsAt,
            endsAt: membership.endsAt ?? undefined,
          },
        ]
      : []
  })
  const assignmentViews = assignments.flatMap((assignment) => {
    const position = positionsById.get(assignment.positionId)
    if (!position) return []
    return [
      {
        id: assignment.id,
        positionId: position.id,
        positionName: position.name,
        scopeLabel: formatPositionScopeLabel(position.scopes),
        startsAt: assignment.startsAt,
        endsAt: assignment.endsAt ?? undefined,
      },
    ]
  })

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    emailVerified: account.emailVerified,
    status: user.status,
    homePlacement: {
      choir: currentChoir
        ? { id: currentChoir.choirId, name: choirById.get(currentChoir.choirId)?.name ?? 'Unknown Choir' }
        : null,
      section: currentSection
        ? {
            id: currentSection.sectionId,
            name: formatPlacementLabel(currentSection, sectionById, choirById) ?? 'Unknown Section',
          }
        : null,
    },
    groups: listGroups()
      .map((group) => ({ id: group.id, name: formatGroupPath(groups, group) }))
      .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id)),
    positions: listPositions()
      .map((position) => ({
        id: position.id,
        label: formatPositionLabel(position.name, formatPositionScopeLabel(position.scopes)),
      }))
      .sort((first, second) => first.label.localeCompare(second.label) || first.id.localeCompare(second.id)),
    currentMemberships: membershipViews
      .filter((membership) => isCurrentDatedPeriod({ ...membership, endsAt: membership.endsAt ?? null }, at))
      .sort((first, second) => first.groupName.localeCompare(second.groupName) || first.id.localeCompare(second.id)),
    currentAssignments: assignmentViews
      .filter((assignment) => isCurrentDatedPeriod({ ...assignment, endsAt: assignment.endsAt ?? null }, at))
      .sort(
        (first, second) =>
          first.positionName.localeCompare(second.positionName) ||
          first.scopeLabel.localeCompare(second.scopeLabel) ||
          first.id.localeCompare(second.id),
      ),
  }
}

export const listMemberCollection = listCollection
export const getMemberDetail = getDetail

function formatPlacementLabel(
  placement: { sectionId: string; voice: Voice } | undefined,
  sections: ReadonlyMap<string, { name: string; choirId: string }>,
  choirs: ReadonlyMap<string, { shortName: string }>,
) {
  if (!placement) return null
  if (!isFineVoice(placement.voice)) return null
  const section = sections.get(placement.sectionId)
  const choir = section ? choirs.get(section.choirId) : undefined
  return choir ? formatFineGrainedPlacementName(choir.shortName, placement.voice) : null
}

function formatPlacementVoice(placement: { voice: Voice } | undefined): FineVoice | null {
  if (!placement) return null
  return isFineVoice(placement.voice) ? placement.voice : null
}
