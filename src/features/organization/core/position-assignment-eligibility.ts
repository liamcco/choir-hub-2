import type { Position, PositionScope } from '@/core/topology'
import { type FineVoice, type PositionAssignmentEligibilityRequirement, type Voice, voiceMatch } from '@/core/types'
import type { MemberStatus } from '@/drizzle/schema'
import { isCurrentDatedPeriod } from './dated-history'

type DatedEligibilityFact = {
  startsAt: Date
  endsAt: Date | null
}

export type PositionAssignmentEligibilityFacts = {
  memberStatus: MemberStatus
  choirMemberships: readonly (DatedEligibilityFact & { choirId: string })[]
  sectionPlacements: readonly (DatedEligibilityFact & { sectionId: string; voice: FineVoice })[]
  voiceCapabilities: readonly Voice[]
}

export type PositionAssignmentEligibilityFailure = {
  type: 'choirMembership' | 'sectionPlacement' | 'memberStatus' | 'voiceCapability'
  message: string
}

export type PositionAssignmentEligibilityResult = {
  eligible: boolean
  failures: readonly PositionAssignmentEligibilityFailure[]
}

export function evaluatePositionAssignmentEligibility(input: {
  position: Position
  startsAt: Date
  facts: PositionAssignmentEligibilityFacts
}): PositionAssignmentEligibilityResult {
  const failures = [
    ...evaluateScopeEligibility(input.position.scopes, input.startsAt, input.facts),
    ...evaluateMemberStatus(input.position.eligibility?.requirements ?? [], input.facts.memberStatus),
  ]
  const explicitRequirements = (input.position.eligibility?.requirements ?? []).filter(
    (requirement) => requirement.type !== 'memberStatus',
  )
  const explicitFailures = evaluateExplicitRequirements(
    explicitRequirements,
    input.facts,
    input.position.eligibility?.mode ?? 'all',
  )

  return {
    eligible: failures.length === 0 && explicitFailures.length === 0,
    failures: [...failures, ...explicitFailures],
  }
}

function evaluateScopeEligibility(
  scopes: readonly PositionScope[],
  startsAt: Date,
  facts: PositionAssignmentEligibilityFacts,
): PositionAssignmentEligibilityFailure[] {
  const choirScopes = scopes.filter((scope) => scope.type === 'choir')
  const sectionScopes = scopes.filter((scope) => scope.type === 'section')
  const matchingScope =
    choirScopes.some((scope) =>
      facts.choirMemberships.some(
        (membership) => membership.choirId === scope.choirId && isCurrentDatedPeriod(membership, startsAt),
      ),
    ) ||
    sectionScopes.some((scope) =>
      facts.sectionPlacements.some(
        (placement) => placement.sectionId === scope.sectionId && isCurrentDatedPeriod(placement, startsAt),
      ),
    )
  if ((choirScopes.length > 0 || sectionScopes.length > 0) && !matchingScope)
    return [
      {
        type: choirScopes.length > 0 ? 'choirMembership' : 'sectionPlacement',
        message: 'This Position requires matching Choir Membership or Section Placement when the Assignment starts.',
      },
    ]

  return []
}

function evaluateMemberStatus(
  requirements: readonly PositionAssignmentEligibilityRequirement[],
  memberStatus: MemberStatus,
): PositionAssignmentEligibilityFailure[] {
  const requirement = requirements.find((candidate) => candidate.type === 'memberStatus')
  if (requirement?.value === 'formerAllowed') return []
  const allowed = requirement?.value === 'activeOnly' ? ['ACTIVE'] : ['ACTIVE', 'PASSIVE']
  if (allowed.includes(memberStatus)) return []
  return [{ type: 'memberStatus', message: 'This Position only allows Active Users.' }]
}

function evaluateExplicitRequirements(
  requirements: readonly PositionAssignmentEligibilityRequirement[],
  facts: PositionAssignmentEligibilityFacts,
  mode: 'all' | 'any',
): PositionAssignmentEligibilityFailure[] {
  if (requirements.length === 0) return []
  const evaluated = requirements.map((requirement) => evaluateRequirement(requirement, facts))
  if (mode === 'all') return evaluated.flat()
  if (evaluated.some((result) => result.length === 0)) return []
  return evaluated.flat()
}

function evaluateRequirement(
  requirement: PositionAssignmentEligibilityRequirement,
  facts: PositionAssignmentEligibilityFacts,
): PositionAssignmentEligibilityFailure[] {
  if (requirement.type === 'memberStatus') return []
  const matches = facts.voiceCapabilities.some((actual) =>
    requirement.voices.some((criterion) => voiceMatch({ input: actual, criterion })),
  )
  if (matches) return []
  return [{ type: 'voiceCapability', message: 'This Position requires a matching Voice Capability.' }]
}
