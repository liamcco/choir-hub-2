import { isFineVoice, voiceOrder } from '@/core/types'
import type { PlacementUser } from './query'

export function filterPlacementUsers(users: readonly PlacementUser[], area?: string, section?: string) {
  return users.filter((user) => {
    if (!area) return false
    if (area === 'others-no-section') return !!user.choirId && !user.sectionId
    if (area === 'others-no-choir') return !user.choirId
    if (area === 'others') return !user.choirId || !user.sectionId
    if (section) return user.sectionId === section
    return user.choirId === area
  })
}

export function visiblePlacementUsers(users: readonly PlacementUser[]) {
  return users.filter((user) => user.status !== 'FORMER')
}

export function sortPlacementUsers(users: readonly PlacementUser[]) {
  return [...users].sort((a, b) => {
    const statusOrder = statusRank(a) - statusRank(b)
    if (statusOrder !== 0) return statusOrder
    const voiceOrderDifference = placementVoiceOrder(a.voice) - placementVoiceOrder(b.voice)
    if (voiceOrderDifference !== 0) return voiceOrderDifference
    return a.name.localeCompare(b.name)
  })
}

function statusRank(user: PlacementUser) {
  return user.status === 'ACTIVE' ? 0 : 1
}

function placementVoiceOrder(voice: string | null) {
  return voice && isFineVoice(voice) ? voiceOrder(voice) : Number.POSITIVE_INFINITY
}

export function placementCounts(users: readonly PlacementUser[]) {
  const counts = new Map<string, number>()
  for (const user of users) {
    if (user.status === 'ACTIVE') {
      if (user.choirId) counts.set(user.choirId, (counts.get(user.choirId) ?? 0) + 1)
      if (user.sectionId) counts.set(user.sectionId, (counts.get(user.sectionId) ?? 0) + 1)
    }
  }
  const visibleUsers = visiblePlacementUsers(users)
  counts.set('others', visibleUsers.filter((user) => !user.choirId || !user.sectionId).length)
  counts.set('others-no-section', visibleUsers.filter((user) => !!user.choirId && !user.sectionId).length)
  counts.set('others-no-choir', visibleUsers.filter((user) => !user.choirId).length)
  return counts
}
