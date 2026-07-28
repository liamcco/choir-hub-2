import { listPositions, topology } from '@/core/topology'

/**
 * Generated people and relationships for the demo/development/e2e database.
 *
 * The choices are seeded, so reseeding produces the same board and committee
 * rosters every time while keeping this file independent of roster size.
 */

type DemoVoice = 'S1' | 'S2' | 'A1' | 'A2' | 'T1' | 'T2' | 'B1' | 'B2'

type ChoirSection = {
  choirId: string
  sectionId: string
  name: string
  voices: readonly DemoVoice[]
  passiveCount: number
}

type HistoricalChoirMembership = {
  id: string
  personKey: string
  choirId: string
  startsAt: string
  endsAt: string
}

type HistoricalSectionPlacement = HistoricalChoirMembership & {
  sectionId: string
  voice: DemoVoice
}

type HistoricalRelationship = {
  id: string
  personKey: string
  targetId: string
  startsAt: string
  endsAt: string
}

const choirSections: ChoirSection[] = topology.sections.map((section, index) => ({
  choirId: section.choirId,
  sectionId: section.id,
  name: section.name,
  voices: section.allowedVoices,
  // Two passive members in the first six sections and three in the last
  // six gives exactly 30 passive members across all 12 sections.
  passiveCount: index < 2 ? 2 : 3,
}))

function generateSingers() {
  return choirSections.flatMap((section) =>
    Array.from({ length: 10 + section.passiveCount }, (_, index) => {
      const memberNumber = index + 1
      const isActive = memberNumber <= 10

      return {
        key: `${section.sectionId}-${String(memberNumber).padStart(2, '0')}`,
        email: `demo-${section.sectionId}-${String(memberNumber).padStart(2, '0')}@example.com`,
        name: `${section.choirId.toUpperCase()} ${section.name} Demo ${String(memberNumber).padStart(2, '0')}`,
        status: isActive ? ('active' as const) : ('passive' as const),
        choirId: section.choirId,
        sectionId: section.sectionId,
        voice: section.voices[index % section.voices.length],
      }
    }),
  )
}

// A small seeded shuffle gives the demo realistic-looking assignments while
// keeping the result reproducible for screenshots, tests, and local reseeds.
function shuffle<T>(items: readonly T[], seed: number): T[] {
  const shuffled = [...items]
  let state = seed

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

const singers = generateSingers()
const singersByKey = new Map(singers.map((person) => [person.key, person]))
const activeSingerKeys = singers.filter((person) => person.status === 'active').map(({ key }) => key)
const placedSingerKeys = singers.map(({ key }) => key)

const boardPersonKeys = shuffle(activeSingerKeys, 20260724).slice(0, 8)
const boardPeople = new Set(boardPersonKeys)
const nonBoardSingerKeys = placedSingerKeys.filter((key) => !boardPeople.has(key))

const conductors = [
  { key: 'conductor-mk', email: 'demo-conductor-mk@example.com', name: 'MK Conductor' },
  { key: 'conductor-kk', email: 'demo-conductor-kk@example.com', name: 'KK Conductor' },
  { key: 'conductor-dk', email: 'demo-conductor-dk@example.com', name: 'DK Conductor' },
].map((person) => ({ ...person, status: 'active' as const }))

const formerMembers = Array.from({ length: 10 }, (_, index) => ({
  key: `former-${String(index + 1).padStart(2, '0')}`,
  email: `demo-former-${String(index + 1).padStart(2, '0')}@example.com`,
  name: `Former Demo ${String(index + 1).padStart(2, '0')}`,
  status: 'former' as const,
}))

const boardPositionIds = [
  'president',
  'vice-president',
  'treasurer',
  'secretary',
  'master-of-parties',
  'master-of-gigs',
  'master-of-concerts',
  'master-of-pr',
] as const

const conductorPositionIds = new Set(['mk-conductor', 'kk-conductor', 'dk-conductor'])

const committeeDefinitions = [
  ...topology.groups
    .filter((group) => group.kind === 'committee')
    .map((group) => ({
      groupId: group.id,
      choirId: group.scope.type === 'choir' ? group.scope.choirId : undefined,
    })),
]

// Ensure a few passive members are visible in committee views, while all
// other committee members are selected independently and may overlap.
const passiveCommitteeGroupIds = new Set(['recruitment-committee', 'kk-party', 'dk-concert'])
const groupMemberships = committeeDefinitions.flatMap(({ groupId, choirId }) => {
  const eligibleKeys = nonBoardSingerKeys.filter((key) => !choirId || singersByKey.get(key)?.choirId === choirId)
  const passiveKeys = eligibleKeys.filter((key) => singersByKey.get(key)?.status === 'passive')
  const requiredPassiveKey = passiveCommitteeGroupIds.has(groupId)
    ? shuffle(passiveKeys, groupId.length * 3571)[0]
    : undefined
  const remainingKeys = eligibleKeys.filter((key) => key !== requiredPassiveKey)
  const selectedKeys = [requiredPassiveKey, ...shuffle(remainingKeys, groupId.length * 7919).slice(0, 4)]
    .filter((key): key is string => !!key)
    .slice(0, 4)

  return selectedKeys.map((personKey, index) => ({
    id: `demo-committee-membership-${groupId}-${index + 1}`,
    groupId,
    personKey,
  }))
})

// Keep a small, readable slice of the old roster so the demo exercises the
// historical views as well as the current roster. Former Users deliberately
// keep these ended relationships: Member Status describes the User today,
// while dated relationships describe what was true during the period.
const formerHistoricalChoirMemberships: readonly HistoricalChoirMembership[] = [
  {
    id: 'demo-history-choir-former-01',
    personKey: 'former-01',
    choirId: 'mk',
    startsAt: '2022-01-01',
    endsAt: '2023-06-30',
  },
  {
    id: 'demo-history-choir-former-02',
    personKey: 'former-02',
    choirId: 'kk',
    startsAt: '2021-01-01',
    endsAt: '2024-06-30',
  },
  {
    id: 'demo-history-choir-former-03',
    personKey: 'former-03',
    choirId: 'dk',
    startsAt: '2023-01-01',
    endsAt: '2025-06-30',
  },
  {
    id: 'demo-history-choir-former-04',
    personKey: 'former-04',
    choirId: 'kk',
    startsAt: '2020-01-01',
    endsAt: '2022-06-30',
  },
  {
    id: 'demo-history-choir-former-05',
    personKey: 'former-05',
    choirId: 'mk',
    startsAt: '2024-01-01',
    endsAt: '2025-06-30',
  },
]

const historicalPeriodByPerson = new Map(
  [...singers, ...conductors].map((person, index) => [
    person.key,
    {
      startsAt: `${2015 + (index % 5)}-01-01`,
      endsAt: '2026-01-01',
    },
  ]),
)

const generatedHistoricalChoirMemberships = singers.map((person) => {
  const period = historicalPeriodByPerson.get(person.key)
  if (!period) throw new Error(`Missing historical period for ${person.key}.`)
  return {
    id: `demo-history-choir-${person.key}`,
    personKey: person.key,
    choirId: person.choirId,
    ...period,
  }
})
const generatedHistoricalChoirMembershipByPerson = new Map(
  generatedHistoricalChoirMemberships.map((membership) => [membership.personKey, membership]),
)

const historicalChoirMemberships: readonly HistoricalChoirMembership[] = [
  ...formerHistoricalChoirMemberships,
  ...generatedHistoricalChoirMemberships,
]

const historicalSectionPlacements: readonly HistoricalSectionPlacement[] = [
  { ...formerHistoricalChoirMemberships[0], sectionId: 'mk-t1', voice: 'T1' },
  { ...formerHistoricalChoirMemberships[1], sectionId: 'kk-a', voice: 'A1' },
  { ...formerHistoricalChoirMemberships[2], sectionId: 'dk-s1', voice: 'S1' },
  { ...formerHistoricalChoirMemberships[3], sectionId: 'kk-t', voice: 'T1' },
  { ...formerHistoricalChoirMemberships[4], sectionId: 'mk-b1', voice: 'B1' },
  ...singers.map((person) => {
    const membership = generatedHistoricalChoirMembershipByPerson.get(person.key)
    if (!membership) throw new Error(`Missing generated historical membership for ${person.key}.`)
    return { ...membership, sectionId: person.sectionId, voice: person.voice }
  }),
]

const historicalGroupMemberships: readonly HistoricalRelationship[] = [
  {
    id: 'demo-history-group-former-01',
    personKey: 'former-01',
    targetId: 'mk-party',
    startsAt: '2022-01-01',
    endsAt: '2023-06-30',
  },
  {
    id: 'demo-history-group-former-02',
    personKey: 'former-02',
    targetId: 'recruitment-committee',
    startsAt: '2021-01-01',
    endsAt: '2024-06-30',
  },
  {
    id: 'demo-history-group-former-03',
    personKey: 'former-03',
    targetId: 'dk-concert',
    startsAt: '2023-01-01',
    endsAt: '2025-06-30',
  },
  ...groupMemberships.map((membership, index) => ({
    id: `demo-history-${membership.id}`,
    personKey: membership.personKey,
    targetId: membership.groupId,
    startsAt: `${2015 + (index % 5)}-01-01`,
    endsAt: '2026-01-01',
  })),
]

const activeSingers = singers.filter((person) => person.status === 'active')
const groupScopes: Map<string, string> = new Map(
  topology.groups.flatMap((group) => (group.scope.type === 'choir' ? [[group.id, group.scope.choirId] as const] : [])),
)

function eligiblePeopleForPosition(position: (typeof topology.positions)[number]) {
  const sectionScope = position.scopes.find((scope) => scope.type === 'section')
  if (sectionScope?.type === 'section')
    return activeSingers.filter((person) => person.sectionId === sectionScope.sectionId)

  const choirScope = position.scopes.find((scope) => scope.type === 'choir')
  if (choirScope?.type === 'choir') return activeSingers.filter((person) => person.choirId === choirScope.choirId)

  const groupScope = position.scopes.find((scope) => scope.type === 'group')
  if (groupScope?.type === 'group') {
    const choirId = groupScopes.get(groupScope.groupId)
    if (choirId) return activeSingers.filter((person) => person.choirId === choirId)
  }

  return activeSingers
}

const alreadyAssignedPositionIds = new Set([...boardPositionIds, ...conductorPositionIds])
const remainingPositions = listPositions().filter((position) => !alreadyAssignedPositionIds.has(position.id))
const positionsToAssign = shuffle(remainingPositions, 20260725).slice(0, Math.round(remainingPositions.length * 0.9))
const additionalPositionAssignments = positionsToAssign.map((position, index) => {
  const eligiblePeople = eligiblePeopleForPosition(position)
  const person = shuffle(eligiblePeople, 8101 + index * 97)[0]
  if (!person) throw new Error(`No eligible demo user for Position ${position.id}.`)
  return { positionId: position.id, personKey: person.key }
})

const positionAssignments = [
  ...boardPositionIds.map((positionId, index) => ({ positionId, personKey: boardPersonKeys[index] })),
  { positionId: 'mk-conductor', personKey: 'conductor-mk' },
  { positionId: 'kk-conductor', personKey: 'conductor-kk' },
  { positionId: 'dk-conductor', personKey: 'conductor-dk' },
  ...additionalPositionAssignments,
]

const historicalPositionAssignments = [
  {
    id: 'demo-history-assignment-former-01',
    targetId: 'secretary',
    personKey: 'former-01',
    startsAt: '2022-01-01',
    endsAt: '2023-06-30',
  },
  {
    id: 'demo-history-assignment-former-02',
    targetId: 'kk-conductor',
    personKey: 'former-02',
    startsAt: '2021-01-01',
    endsAt: '2024-06-30',
  },
  {
    id: 'demo-history-assignment-former-03',
    targetId: 'dk-master-of-concerts',
    personKey: 'former-03',
    startsAt: '2023-01-01',
    endsAt: '2025-06-30',
  },
  {
    id: 'demo-history-assignment-former-04',
    targetId: 'treasurer',
    personKey: 'former-04',
    startsAt: '2020-01-01',
    endsAt: '2022-06-30',
  },
  {
    id: 'demo-history-assignment-former-05',
    targetId: 'mk-t1-voice-parent',
    personKey: 'former-05',
    startsAt: '2024-01-01',
    endsAt: '2025-06-30',
  },
  ...positionAssignments.map((assignment) => {
    const period = historicalPeriodByPerson.get(assignment.personKey)
    if (!period) throw new Error(`Missing historical period for ${assignment.personKey}.`)
    return {
      id: `demo-history-assignment-${assignment.positionId}`,
      targetId: assignment.positionId,
      personKey: assignment.personKey,
      startsAt: period.startsAt,
      endsAt: '2020-01-01',
    }
  }),
]

export const demoSeedData = {
  userPassword: 'password',
  startsAt: '2026-01-01T00:00:00.000Z',

  people: [...singers, ...formerMembers, ...conductors],

  positionAssignments,

  groupMemberships,
  historicalChoirMemberships,
  historicalSectionPlacements,
  historicalGroupMemberships,
  historicalPositionAssignments,
} as const

export const demoSeedSummary = {
  activeSingerCount: singers.filter((person) => person.status === 'active').length,
  passiveSingerCount: singers.filter((person) => person.status === 'passive').length,
  formerMemberCount: formerMembers.length,
  conductorCount: conductors.length,
  boardCount: boardPersonKeys.length,
  additionalPositionAssignmentCount: additionalPositionAssignments.length,
  committeeMembershipCount: groupMemberships.length,
  historicalChoirMembershipCount: historicalChoirMemberships.length,
  historicalSectionPlacementCount: historicalSectionPlacements.length,
  historicalGroupMembershipCount: historicalGroupMemberships.length,
  historicalPositionAssignmentCount: historicalPositionAssignments.length,
}
