import { positionCatalog, referenceCatalogData } from '@/core/reference-catalog'

/**
 * Generated people and relationships for the demo/development/e2e database.
 *
 * The choices are seeded, so reseeding produces the same board and committee
 * rosters every time while keeping this file independent of roster size.
 */

type DemoVoiceType = 'S1' | 'S2' | 'A1' | 'A2' | 'T1' | 'T2' | 'B1' | 'B2'

type ChoirSection = {
  choirId: string
  sectionId: string
  name: string
  voiceTypes: readonly DemoVoiceType[]
  passiveCount: number
}

const choirSections: ChoirSection[] = referenceCatalogData.choirs.flatMap((choir) =>
  choir.sections.map((definition, index) => {
    const name = typeof definition === 'string' ? definition : definition.name
    const voiceTypes = typeof definition === 'string' ? [definition] : definition.allowedVoiceTypes

    return {
      choirId: choir.id,
      sectionId: `${choir.id}-${name.toLowerCase()}`,
      name,
      voiceTypes,
      // Two passive members in the first six sections and three in the last
      // six gives exactly 30 passive members across all 12 sections.
      passiveCount: index < 2 ? 2 : 3,
    }
  }),
)

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
        voiceType: section.voiceTypes[index % section.voiceTypes.length],
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
  ...referenceCatalogData.groups.csk
    .filter((group) => group.id !== 'board')
    .map((group) => ({ groupId: group.id, choirId: undefined })),
  ...referenceCatalogData.choirs.flatMap((choir) =>
    referenceCatalogData.groups.perChoir.map((group) => ({ groupId: `${choir.id}-${group.id}`, choirId: choir.id })),
  ),
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

const activeSingers = singers.filter((person) => person.status === 'active')
const groupScopes: Map<string, string> = new Map(
  referenceCatalogData.choirs.flatMap((choir) =>
    referenceCatalogData.groups.perChoir.map((group) => [`${choir.id}-${group.id}`, choir.id] as const),
  ),
)

function eligiblePeopleForPosition(position: (typeof positionCatalog)[number]) {
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
const remainingPositions = positionCatalog.filter((position) => !alreadyAssignedPositionIds.has(position.id))
const positionsToAssign = shuffle(remainingPositions, 20260725).slice(0, Math.round(remainingPositions.length * 0.9))
const additionalPositionAssignments = positionsToAssign.map((position, index) => {
  const eligiblePeople = eligiblePeopleForPosition(position)
  const person = shuffle(eligiblePeople, 8101 + index * 97)[0]
  if (!person) throw new Error(`No eligible demo user for Position ${position.id}.`)
  return { positionId: position.id, personKey: person.key }
})

export const demoSeedData = {
  userPassword: 'password',
  startsAt: '2026-01-01T00:00:00.000Z',

  people: [...singers, ...formerMembers, ...conductors],

  positionAssignments: [
    ...boardPositionIds.map((positionId, index) => ({ positionId, personKey: boardPersonKeys[index] })),
    { positionId: 'mk-conductor', personKey: 'conductor-mk' },
    { positionId: 'kk-conductor', personKey: 'conductor-kk' },
    { positionId: 'dk-conductor', personKey: 'conductor-dk' },
    ...additionalPositionAssignments,
  ],

  groupMemberships,
} as const

export const demoSeedSummary = {
  activeSingerCount: singers.filter((person) => person.status === 'active').length,
  passiveSingerCount: singers.filter((person) => person.status === 'passive').length,
  formerMemberCount: formerMembers.length,
  conductorCount: conductors.length,
  boardCount: boardPersonKeys.length,
  additionalPositionAssignmentCount: additionalPositionAssignments.length,
  committeeMembershipCount: groupMemberships.length,
}
