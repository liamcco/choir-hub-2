import { Suspense } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AccountCard } from './account-card'
import { GroupsCard } from './groups-card'
import { PositionsCard } from './positions-card'
import { SecurityCard } from './security-card'
import {
  GroupsCardSkeleton,
  PositionsCardSkeleton,
  ProfileCardSkeleton,
  SecurityCardSkeleton,
} from './profile-skeletons'

export function ProfileTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="positions">Positions</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Suspense fallback={<ProfileCardSkeleton />}>
          <AccountCard />
        </Suspense>
      </TabsContent>

      <TabsContent value="groups">
        <Suspense fallback={<GroupsCardSkeleton />}>
          <GroupsCard />
        </Suspense>
      </TabsContent>

      <TabsContent value="positions">
        <Suspense fallback={<PositionsCardSkeleton />}>
          <PositionsCard />
        </Suspense>
      </TabsContent>

      <TabsContent value="security">
        <Suspense fallback={<SecurityCardSkeleton />}>
          <SecurityCard />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
