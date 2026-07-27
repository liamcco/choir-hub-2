import type { PlacementUser } from './query'

export function filterPlacementUsers(users: readonly PlacementUser[], area?: string, section?: string) {
  return users.filter((user) => {
    if (!area) return true
    if (area === 'others-no-section') return !!user.choirId && !user.sectionId
    if (area === 'others-no-choir') return !user.choirId
    if (area === 'others') return !user.choirId || !user.sectionId
    if (section) return user.sectionId === section
    return user.choirId === area
  })
}

export function placementCounts(users: readonly PlacementUser[]) {
  const counts = new Map<string, number>()
  for (const user of users) {
    if (user.status === 'ACTIVE') {
      if (user.choirId) counts.set(user.choirId, (counts.get(user.choirId) ?? 0) + 1)
      if (user.sectionId) counts.set(user.sectionId, (counts.get(user.sectionId) ?? 0) + 1)
    }
  }
  counts.set('others', users.filter((user) => !user.choirId || !user.sectionId).length)
  counts.set('others-no-section', users.filter((user) => !!user.choirId && !user.sectionId).length)
  counts.set('others-no-choir', users.filter((user) => !user.choirId).length)
  return counts
}
