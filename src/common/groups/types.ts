import type {
  GetGroupKindsResponse,
  GetGroupMembersResponse,
  GetGroupsResponse,
  GetPositionsResponse,
  GetUsersResponse,
} from '@/lib/api-client/types.gen'

export type Group = GetGroupsResponse[number]
export type GroupKind = GetGroupKindsResponse[number]
export type User = GetUsersResponse[number]
export type Membership = GetGroupMembersResponse[number]
export type Position = GetPositionsResponse[number]
