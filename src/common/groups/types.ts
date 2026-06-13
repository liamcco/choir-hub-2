import type {
  GetGroupKindsResponse,
  GetGroupMembersResponse,
  GetGroupPositionsResponse,
  GetGroupsResponse,
  GetPeopleResponse,
} from '@/lib/api-client/types.gen'

export type Group = GetGroupsResponse[number]
export type GroupKind = GetGroupKindsResponse[number]
export type Person = GetPeopleResponse['people'][number]
export type Membership = GetGroupMembersResponse[number]
export type Position = GetGroupPositionsResponse[number]
