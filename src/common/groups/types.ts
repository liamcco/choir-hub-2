import type {
  GetGroupKindsResponse,
  GetGroupMembersResponse,
  GetGroupPositionsResponse,
  GetGroupsResponse,
  GetUsersResponse,
} from '@/lib/api-client/types.gen'

export type Group = GetGroupsResponse[number]
export type GroupKind = GetGroupKindsResponse[number]
export type User = GetUsersResponse[number]
export type Membership = GetGroupMembersResponse[number]
export type Position = GetGroupPositionsResponse[number]
