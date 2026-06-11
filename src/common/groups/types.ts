import type {
  GetDirectGroupMembershipsResponse,
  GetGroupKindsResponse,
  GetGroupPositionsResponse,
  GetGroupsResponse,
  GetPeopleResponse,
} from '@/lib/api-client/types.gen'

export type Group = GetGroupsResponse['groups'][number]
export type GroupKind = GetGroupKindsResponse['groupKinds'][number]
export type Person = GetPeopleResponse['people'][number]
export type Membership = GetDirectGroupMembershipsResponse['memberships'][number]
export type Position = GetGroupPositionsResponse['positions'][number]
