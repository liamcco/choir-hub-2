// fallow-ignore-file security-client-server-leak -- Next.js Server Actions are intentionally imported into client forms.
'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useMemo, useState } from 'react'
import type { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'
import {
  BanIcon,
  KeyRoundIcon,
  LayersIcon,
  PlusIcon,
  ShieldIcon,
  Trash2Icon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'

import {
  addUserToGroupAction,
  assignPositionToUserAction,
  banUserAction,
  createUserAction,
  deleteGroupAction,
  deleteGroupKindAction,
  deletePositionAction,
  removeUserAction,
  removeUserFromGroupAction,
  revokeUserSessionsAction,
  saveGroupAction,
  saveGroupKindAction,
  savePositionAction,
  setUserPasswordAction,
  setUserRoleAction,
  unassignPositionAction,
  unbanUserAction,
  updateUserBasicsAction,
} from '@/app/admin/_lib/actions'
import type { AdminActionState, AdminDashboardData, AdminGroup, AdminMemberDetailData, AdminPosition } from '@/app/admin/_lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const initialActionState: AdminActionState = { status: 'idle' }

type AdminAction = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function roleIsAdmin(role: string) {
  return role
    .split(',')
    .map((entry) => entry.trim())
    .includes('admin')
}

function ActionMessage({ state }: { state: AdminActionState }) {
  if (state.status === 'idle' || !state.message) {
    return null
  }

  return (
    <p className={state.status === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
      {state.message}
    </p>
  )
}

function SubmitButton({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: React.ComponentProps<typeof Button>['variant']
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} variant={variant}>
      {pending ? 'Saving...' : children}
    </Button>
  )
}

function ActionForm({
  action,
  children,
  className,
}: {
  action: AdminAction
  children: (state: AdminActionState) => React.ReactNode
  className?: string
}) {
  const [state, formAction] = useActionState(action, initialActionState)

  return (
    <form action={formAction} className={className}>
      {children(state)}
    </form>
  )
}

function DestructiveAction({
  action,
  children,
  description,
  hidden,
  title,
}: {
  action: AdminAction
  children: React.ReactNode
  description: string
  hidden: Record<string, string>
  title: string
}) {
  const [state, formAction] = useActionState(action, initialActionState)

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <ActionMessage state={state} />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={formAction}>
            {Object.entries(hidden).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <AlertDialogAction type="submit" variant="destructive">
              Confirm
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="users">
          <UsersIcon />
          Users
        </TabsTrigger>
        <TabsTrigger value="groups">
          <LayersIcon />
          Groups
        </TabsTrigger>
        <TabsTrigger value="positions">
          <ShieldIcon />
          Positions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <UsersTab data={data} />
      </TabsContent>
      <TabsContent value="groups">
        <GroupsTab data={data} />
      </TabsContent>
      <TabsContent value="positions">
        <PositionsTab data={data} />
      </TabsContent>
    </Tabs>
  )
}

function UsersTab({ data }: { data: AdminDashboardData }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [groupId, setGroupId] = useState('all')
  const [page, setPage] = useState(1)
  const normalizedQuery = query.trim().toLowerCase()
  const pageSize = 50
  const users = useMemo(() => {
    return data.users.filter((user) =>
      (groupId === 'all' || user.groupIds.includes(groupId)) &&
      (!normalizedQuery ||
        [user.name, user.email, user.username, user.role, user.groupNames.join(' ')].some((value) =>
          value?.toLowerCase().includes(normalizedQuery),
        )),
    )
  }, [data.users, groupId, normalizedQuery])
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>Directory of every member. Select a row to open the member detail page.</CardDescription>
          </div>
          <CreateUserDialog />
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_minmax(14rem,18rem)]">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search members"
          />
          <NativeSelect
            aria-label="Filter by group"
            value={groupId}
            onChange={(event) => {
              setGroupId(event.target.value)
              setPage(1)
            }}
            className="w-full"
          >
            <NativeSelectOption value="all">All members</NativeSelectOption>
            {data.groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.kindName}: {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead className="text-right">Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageUsers.map((user) => (
              <TableRow
                key={user.id}
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/users/${user.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    router.push(`/admin/users/${user.id}`)
                  }
                }}
              >
                <TableCell>
                  <span className="font-medium">{user.name}</span>
                  {user.banned ? <Badge variant="destructive" className="ml-2">Banned</Badge> : null}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username ?? 'Not set'}</TableCell>
                <TableCell>
                  <UserBadges banned={false} role={user.role} />
                </TableCell>
                <TableCell className="max-w-md truncate">{user.groupNames.join(', ') || 'No groups'}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {user.positionCount} positions / {user.sessionCount} sessions
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pageUsers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No members found</EmptyTitle>
              <EmptyDescription>Adjust the search or group filter.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {(currentPage - 1) * pageSize + (pageUsers.length > 0 ? 1 : 0)}-
            {(currentPage - 1) * pageSize + pageUsers.length} of {users.length} members
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserBadges({ banned, role }: { banned: boolean; role: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant={roleIsAdmin(role) ? 'default' : 'secondary'}>{role}</Badge>
      {banned ? <Badge variant="destructive">Banned</Badge> : null}
    </div>
  )
}

type GroupKindForm = {
  description: string
  descriptionInputId: string
  id: string
  name: string
  nameInputId: string
  submitLabel: string
  title: string
  triggerLabel: string
  triggerVariant: ComponentProps<typeof Button>['variant']
}

type GroupForm = {
  containerInputId: string
  description: string
  descriptionInputId: string
  id: string
  isContainer: boolean
  kindId: string
  kindInputId: string
  name: string
  nameInputId: string
  parentGroupId: string
  parentInputId: string
  submitLabel: string
}

type PositionForm = {
  currentHolderUserId: string
  description: string
  descriptionInputId: string
  groupIds: Set<string>
  holderInputId: string
  id: string
  name: string
  nameInputId: string
  submitLabel: string
}

function emptyString(value: string | null) {
  return value || ''
}

function getGroupKindForm(kind: AdminDashboardData['groupKinds'][number] | undefined): GroupKindForm {
  if (!kind) {
    return {
      description: '',
      descriptionInputId: 'kind-description-new',
      id: '',
      name: '',
      nameInputId: 'kind-name-new',
      submitLabel: 'Create kind',
      title: 'New group kind',
      triggerLabel: 'New kind',
      triggerVariant: 'default',
    }
  }

  return {
    description: emptyString(kind.description),
    descriptionInputId: `kind-description-${kind.id}`,
    id: kind.id,
    name: kind.name,
    nameInputId: `kind-name-${kind.id}`,
    submitLabel: 'Save kind',
    title: 'Edit group kind',
    triggerLabel: 'Edit',
    triggerVariant: 'outline',
  }
}

function getGroupForm(group: AdminGroup | undefined, kinds: AdminDashboardData['groupKinds']): GroupForm {
  if (!group) {
    return {
      containerInputId: 'group-container-new',
      description: '',
      descriptionInputId: 'group-description-new',
      id: '',
      isContainer: false,
      kindId: kinds[0]?.id || '',
      kindInputId: 'group-kind-new',
      name: '',
      nameInputId: 'group-name-new',
      parentGroupId: '',
      parentInputId: 'group-parent-new',
      submitLabel: 'Create group',
    }
  }

  return {
    containerInputId: `group-container-${group.id}`,
    description: emptyString(group.description),
    descriptionInputId: `group-description-${group.id}`,
    id: group.id,
    isContainer: group.isContainer,
    kindId: group.kindId,
    kindInputId: `group-kind-${group.id}`,
    name: group.name,
    nameInputId: `group-name-${group.id}`,
    parentGroupId: emptyString(group.parentGroupId),
    parentInputId: `group-parent-${group.id}`,
    submitLabel: 'Save group',
  }
}

function getPositionForm(position: AdminPosition | undefined, users: AdminDashboardData['users']): PositionForm {
  const firstUserId = users[0]?.id || ''

  if (!position) {
    return {
      currentHolderUserId: firstUserId,
      description: '',
      descriptionInputId: 'position-description-new',
      groupIds: new Set(),
      holderInputId: 'position-holder-new',
      id: '',
      name: '',
      nameInputId: 'position-name-new',
      submitLabel: 'Create position',
    }
  }

  return {
    currentHolderUserId: position.currentHolderUserId || firstUserId,
    description: emptyString(position.description),
    descriptionInputId: `position-description-${position.id}`,
    groupIds: new Set(position.groupIds),
    holderInputId: `position-holder-${position.id}`,
    id: position.id,
    name: position.name,
    nameInputId: `position-name-${position.id}`,
    submitLabel: 'Save position',
  }
}

function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon />
        New user
      </DialogTrigger>
      <DialogContent>
        <ActionForm action={createUserAction} className="space-y-4">
          {(state) => (
            <>
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
                <DialogDescription>Create a Better Auth user with an optional credential password.</DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new-user-name">Name</FieldLabel>
                  <Input id="new-user-name" name="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-user-email">Email</FieldLabel>
                  <Input id="new-user-email" name="email" type="email" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-user-username">Username</FieldLabel>
                  <Input id="new-user-username" name="username" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-user-password">Password</FieldLabel>
                  <Input id="new-user-password" name="password" type="password" />
                  <FieldDescription>Leave empty to create the user without password credentials.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-user-role">Role</FieldLabel>
                  <NativeSelect id="new-user-role" name="role" className="w-full" defaultValue="user">
                    <NativeSelectOption value="user">User</NativeSelectOption>
                    <NativeSelectOption value="admin">Admin</NativeSelectOption>
                  </NativeSelect>
                </Field>
              </FieldGroup>
              <ActionMessage state={state} />
              <DialogFooter>
                <SubmitButton>Create user</SubmitButton>
              </DialogFooter>
            </>
          )}
        </ActionForm>
      </DialogContent>
    </Dialog>
  )
}

function NoUserSelected() {
  return (
    <Empty className="min-h-96">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserCogIcon />
        </EmptyMedia>
        <EmptyTitle>No user selected</EmptyTitle>
        <EmptyDescription>Create a user or select one from the table.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function UserDetail({ data }: { data: AdminMemberDetailData }) {
  const user = data.selectedUser

  if (!user) {
    return <NoUserSelected />
  }

  const availableGroups = data.groups.filter((group) => !user.memberships.some((membership) => membership.groupId === group.id))
  const availablePositions = data.positions.filter((position) => position.currentHolderUserId !== user.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="truncate">{user.name}</CardTitle>
            <CardDescription className="truncate">{user.email}</CardDescription>
          </div>
          <UserBadges banned={user.banned} role={user.role} />
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <UserBasicsForm key={`basics-${user.id}`} user={user} />
          <UserAuthControls key={`auth-${user.id}`} currentAdminId={data.currentAdminId} user={user} />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <UserGroupsCard key={`groups-${user.id}`} availableGroups={availableGroups} user={user} />
        <UserPositionsCard key={`positions-${user.id}`} availablePositions={availablePositions} user={user} />
      </div>
      <UserSessionsCard key={`sessions-${user.id}`} currentAdminId={data.currentAdminId} user={user} />
    </div>
  )
}

function UserBasicsForm({ user }: { user: NonNullable<AdminMemberDetailData['selectedUser']> }) {
  return (
    <ActionForm action={updateUserBasicsAction} className="space-y-4">
      {(state) => (
        <>
          <input type="hidden" name="userId" value={user.id} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="user-name">Name</FieldLabel>
              <Input id="user-name" name="name" defaultValue={user.name} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-email">Email</FieldLabel>
              <Input id="user-email" name="email" type="email" defaultValue={user.email} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-username">Username</FieldLabel>
              <Input id="user-username" name="username" defaultValue={user.username ?? ''} />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-display-username">Display username</FieldLabel>
              <Input id="user-display-username" name="displayUsername" defaultValue={user.displayUsername ?? ''} />
            </Field>
          </FieldGroup>
          <ActionMessage state={state} />
          <SubmitButton>Save profile</SubmitButton>
        </>
      )}
    </ActionForm>
  )
}

function UserAuthControls({
  currentAdminId,
  user,
}: {
  currentAdminId: string
  user: NonNullable<AdminMemberDetailData['selectedUser']>
}) {
  const isSelf = currentAdminId === user.id

  return (
    <div className="space-y-4">
      <ActionForm action={setUserRoleAction} className="space-y-3">
        {(state) => (
          <>
            <input type="hidden" name="userId" value={user.id} />
            <Field>
              <FieldLabel htmlFor="user-role">Role</FieldLabel>
              <NativeSelect id="user-role" name="role" className="w-full" defaultValue={roleIsAdmin(user.role) ? 'admin' : 'user'}>
                <NativeSelectOption value="user">User</NativeSelectOption>
                <NativeSelectOption value="admin">Admin</NativeSelectOption>
              </NativeSelect>
            </Field>
            <ActionMessage state={state} />
            <SubmitButton>Set role</SubmitButton>
          </>
        )}
      </ActionForm>
      <Separator />
      {user.banned ? (
        <ActionForm action={unbanUserAction} className="space-y-3">
          {(state) => (
            <>
              <input type="hidden" name="userId" value={user.id} />
              <p className="text-sm text-muted-foreground">Ban reason: {user.banReason ?? 'No reason'}</p>
              <ActionMessage state={state} />
              <SubmitButton variant="outline">Unban user</SubmitButton>
            </>
          )}
        </ActionForm>
      ) : (
        <ActionForm action={banUserAction} className="space-y-3">
          {(state) => (
            <>
              <input type="hidden" name="userId" value={user.id} />
              <Field>
                <FieldLabel htmlFor="ban-reason">Ban reason</FieldLabel>
                <Input id="ban-reason" name="banReason" disabled={isSelf} />
              </Field>
              <Field>
                <FieldLabel htmlFor="ban-expires">Expires in seconds</FieldLabel>
                <Input id="ban-expires" name="banExpiresIn" type="number" min="1" disabled={isSelf} />
              </Field>
              <ActionMessage state={state} />
              <SubmitButton variant="destructive">
                <BanIcon />
                Ban user
              </SubmitButton>
            </>
          )}
        </ActionForm>
      )}
      <Separator />
      <ActionForm action={setUserPasswordAction} className="space-y-3">
        {(state) => (
          <>
            <input type="hidden" name="userId" value={user.id} />
            <Field>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <Input id="new-password" name="newPassword" type="password" minLength={8} />
            </Field>
            <ActionMessage state={state} />
            <SubmitButton variant="outline">
              <KeyRoundIcon />
              Set password
            </SubmitButton>
          </>
        )}
      </ActionForm>
      <Separator />
      <DestructiveAction
        action={removeUserAction}
        hidden={{ userId: user.id }}
        title="Remove user?"
        description="This deletes the user, sessions, accounts, memberships, and current position links according to the schema. This cannot be undone."
      >
        <Trash2Icon />
        Remove user
      </DestructiveAction>
    </div>
  )
}

function UserGroupsCard({
  availableGroups,
  user,
}: {
  availableGroups: AdminGroup[]
  user: NonNullable<AdminMemberDetailData['selectedUser']>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Groups</CardTitle>
        <CardDescription>{user.memberships.length} assigned memberships.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionForm action={addUserToGroupAction} className="flex gap-2">
          {(state) => (
            <>
              <input type="hidden" name="userId" value={user.id} />
              <NativeSelect name="groupId" className="min-w-0 flex-1" disabled={availableGroups.length === 0}>
                {availableGroups.map((group) => (
                  <NativeSelectOption key={group.id} value={group.id}>
                    {group.kindName}: {group.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <SubmitButton>Add</SubmitButton>
              <ActionMessage state={state} />
            </>
          )}
        </ActionForm>
        {user.memberships.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No groups</EmptyTitle>
              <EmptyDescription>This user is not assigned to any groups.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {user.memberships.map((membership) => (
              <div key={membership.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{membership.groupName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {membership.groupKindName} / added {formatDate(membership.addedAt)}
                  </p>
                </div>
                <DestructiveAction
                  action={removeUserFromGroupAction}
                  hidden={{ groupId: membership.groupId, userId: user.id }}
                  title="Remove membership?"
                  description="This removes the selected user from the group."
                >
                  Remove
                </DestructiveAction>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UserPositionsCard({
  availablePositions,
  user,
}: {
  availablePositions: AdminPosition[]
  user: NonNullable<AdminMemberDetailData['selectedUser']>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription>{user.positions.length} current positions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActionForm action={assignPositionToUserAction} className="flex gap-2">
          {(state) => (
            <>
              <input type="hidden" name="userId" value={user.id} />
              <NativeSelect name="positionId" className="min-w-0 flex-1" disabled={availablePositions.length === 0}>
                {availablePositions.map((position) => (
                  <NativeSelectOption key={position.id} value={position.id}>
                    {position.name}
                    {position.currentHolderName ? ` (${position.currentHolderName})` : ''}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <SubmitButton>Assign</SubmitButton>
              <ActionMessage state={state} />
            </>
          )}
        </ActionForm>
        {user.positions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No positions</EmptyTitle>
              <EmptyDescription>This user does not currently hold any positions.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {user.positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{position.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {position.groupNames.join(', ') || 'No linked groups'} / since {formatDate(position.heldSince)}
                  </p>
                </div>
                <DestructiveAction
                  action={unassignPositionAction}
                  hidden={{ positionId: position.id }}
                  title="Unassign position?"
                  description="This clears the current holder and held-since date for the position."
                >
                  Unassign
                </DestructiveAction>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UserSessionsCard({
  currentAdminId,
  user,
}: {
  currentAdminId: string
  user: NonNullable<AdminMemberDetailData['selectedUser']>
}) {
  const isSelf = currentAdminId === user.id

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>{user.sessions.length} active or stored sessions.</CardDescription>
        </div>
        <ActionForm action={revokeUserSessionsAction}>
          {(state) => (
            <div className="space-y-2">
              <input type="hidden" name="userId" value={user.id} />
              <SubmitButton variant="outline">Revoke sessions</SubmitButton>
              {isSelf ? <p className="text-xs text-muted-foreground">Revoking yourself may sign you out.</p> : null}
              <ActionMessage state={state} />
            </div>
          )}
        </ActionForm>
      </CardHeader>
      <CardContent>
        {user.sessions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No sessions</EmptyTitle>
              <EmptyDescription>No sessions were found for this user.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>User agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{formatDate(session.createdAt)}</TableCell>
                  <TableCell>{formatDate(session.expiresAt)}</TableCell>
                  <TableCell>{session.ipAddress ?? 'Unknown'}</TableCell>
                  <TableCell className="max-w-sm truncate">{session.userAgent ?? 'Unknown'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function GroupsTab({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Group kinds</CardTitle>
            <CardDescription>High-level structures that classify groups.</CardDescription>
          </div>
          <GroupKindSheet />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.groupKinds.map((kind) => (
            <div key={kind.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{kind.name}</p>
                  <p className="text-sm text-muted-foreground">{kind.description ?? 'No description'}</p>
                </div>
                <Badge variant="secondary">{kind.groupCount}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <GroupKindSheet kind={kind} />
                <DestructiveAction
                  action={deleteGroupKindAction}
                  hidden={{ id: kind.id }}
                  title="Delete group kind?"
                  description="This only succeeds when no groups still use this kind."
                >
                  Delete
                </DestructiveAction>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Manage hierarchy, containers, descriptions, and kind assignments.</CardDescription>
          </div>
          <GroupSheet groups={data.groups} kinds={data.groupKinds} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Counts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-muted-foreground">{group.description ?? 'No description'}</div>
                  </TableCell>
                  <TableCell>{group.kindName}</TableCell>
                  <TableCell>{group.parentGroupName ?? 'None'}</TableCell>
                  <TableCell>
                    {group.memberCount} members / {group.positionCount} positions
                    {group.isContainer ? <Badge className="ml-2">Container</Badge> : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <GroupSheet group={group} groups={data.groups} kinds={data.groupKinds} />
                      <DestructiveAction
                        action={deleteGroupAction}
                        hidden={{ id: group.id }}
                        title="Delete group?"
                        description="This cascades memberships and position links, and clears child parent links according to the schema."
                      >
                        Delete
                      </DestructiveAction>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function GroupKindSheet({ kind }: { kind?: AdminDashboardData['groupKinds'][number] }) {
  const form = getGroupKindForm(kind)

  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant={form.triggerVariant} size="sm" />}>
        {form.triggerLabel}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{form.title}</SheetTitle>
          <SheetDescription>Group kinds are unique by name.</SheetDescription>
        </SheetHeader>
        <ActionForm action={saveGroupKindAction} className="space-y-4 px-4">
          {(state) => <GroupKindFields form={form} state={state} />}
        </ActionForm>
      </SheetContent>
    </Sheet>
  )
}

function GroupKindFields({ form, state }: { form: GroupKindForm; state: AdminActionState }) {
  return (
    <>
      <input type="hidden" name="id" value={form.id} />
      <Field>
        <FieldLabel htmlFor={form.nameInputId}>Name</FieldLabel>
        <Input id={form.nameInputId} name="name" defaultValue={form.name} required />
      </Field>
      <Field>
        <FieldLabel htmlFor={form.descriptionInputId}>Description</FieldLabel>
        <Textarea id={form.descriptionInputId} name="description" defaultValue={form.description} />
      </Field>
      <ActionMessage state={state} />
      <SubmitButton>{form.submitLabel}</SubmitButton>
    </>
  )
}

function GroupSheet({
  group,
  groups,
  kinds,
}: {
  group?: AdminGroup
  groups: AdminGroup[]
  kinds: AdminDashboardData['groupKinds']
}) {
  const form = getGroupForm(group, kinds)
  const parentGroups = groups.filter((candidate) => candidate.id !== form.id)

  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant={group ? 'outline' : 'default'} size="sm" />}>
        {group ? 'Edit' : 'New group'}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{group ? 'Edit group' : 'New group'}</SheetTitle>
          <SheetDescription>Set the group kind, parent, and container behavior.</SheetDescription>
        </SheetHeader>
        <ActionForm action={saveGroupAction} className="space-y-4 px-4">
          {(state) => <GroupFields form={form} kinds={kinds} parentGroups={parentGroups} state={state} />}
        </ActionForm>
      </SheetContent>
    </Sheet>
  )
}

function GroupFields({
  form,
  kinds,
  parentGroups,
  state,
}: {
  form: GroupForm
  kinds: AdminDashboardData['groupKinds']
  parentGroups: AdminGroup[]
  state: AdminActionState
}) {
  return (
    <>
      <input type="hidden" name="id" value={form.id} />
      <Field>
        <FieldLabel htmlFor={form.nameInputId}>Name</FieldLabel>
        <Input id={form.nameInputId} name="name" defaultValue={form.name} required />
      </Field>
      <Field>
        <FieldLabel htmlFor={form.kindInputId}>Kind</FieldLabel>
        <NativeSelect id={form.kindInputId} name="kindId" className="w-full" defaultValue={form.kindId}>
          {kinds.map((kind) => (
            <NativeSelectOption key={kind.id} value={kind.id}>
              {kind.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={form.parentInputId}>Parent</FieldLabel>
        <NativeSelect id={form.parentInputId} name="parentGroupId" className="w-full" defaultValue={form.parentGroupId}>
          <NativeSelectOption value="">None</NativeSelectOption>
          {parentGroups.map((candidate) => (
            <NativeSelectOption key={candidate.id} value={candidate.id}>
              {candidate.kindName}: {candidate.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={form.descriptionInputId}>Description</FieldLabel>
        <Textarea id={form.descriptionInputId} name="description" defaultValue={form.description} />
      </Field>
      <Field orientation="horizontal">
        <Switch id={form.containerInputId} name="isContainer" defaultChecked={form.isContainer} />
        <FieldLabel htmlFor={form.containerInputId}>Container group</FieldLabel>
      </Field>
      <ActionMessage state={state} />
      <SubmitButton>{form.submitLabel}</SubmitButton>
    </>
  )
}

function PositionsTab({ data }: { data: AdminDashboardData }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Positions</CardTitle>
          <CardDescription>Manage position definitions, current holders, and linked groups.</CardDescription>
        </div>
        <PositionSheet groups={data.groups} users={data.users} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Holder</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.positions.map((position) => (
              <TableRow key={position.id}>
                <TableCell>
                  <div className="font-medium">{position.name}</div>
                  <div className="text-xs text-muted-foreground">{position.description ?? 'No description'}</div>
                </TableCell>
                <TableCell>
                  {position.currentHolderName ?? 'Vacant'}
                  {position.heldSince ? (
                    <span className="block text-xs text-muted-foreground">Since {formatDate(position.heldSince)}</span>
                  ) : null}
                </TableCell>
                <TableCell>{position.groupNames.join(', ') || 'No groups'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PositionSheet groups={data.groups} position={position} users={data.users} />
                    {position.currentHolderUserId ? (
                      <DestructiveAction
                        action={unassignPositionAction}
                        hidden={{ positionId: position.id }}
                        title="Unassign position?"
                        description="This clears the current holder and held-since date."
                      >
                        Unassign
                      </DestructiveAction>
                    ) : null}
                    <DestructiveAction
                      action={deletePositionAction}
                      hidden={{ id: position.id }}
                      title="Delete position?"
                      description="This removes the position and its group links. This cannot be undone."
                    >
                      Delete
                    </DestructiveAction>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PositionSheet({
  groups,
  position,
  users,
}: {
  groups: AdminGroup[]
  position?: AdminPosition
  users: AdminDashboardData['users']
}) {
  const form = getPositionForm(position, users)

  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant={position ? 'outline' : 'default'} size="sm" />}>
        {position ? 'Edit' : 'New position'}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{position ? 'Edit position' : 'New position'}</SheetTitle>
          <SheetDescription>Assign linked groups here; set current holders from the user workflow.</SheetDescription>
        </SheetHeader>
        <ActionForm action={savePositionAction} className="space-y-4 px-4">
          {(state) => <PositionFields form={form} groups={groups} state={state} />}
        </ActionForm>
        {position ? (
          <ActionForm action={assignPositionToUserAction} className="space-y-3 px-4">
            {(assignState) => <PositionHolderFields form={form} state={assignState} users={users} />}
          </ActionForm>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function PositionFields({
  form,
  groups,
  state,
}: {
  form: PositionForm
  groups: AdminGroup[]
  state: AdminActionState
}) {
  return (
    <>
      <input type="hidden" name="id" value={form.id} />
      <Field>
        <FieldLabel htmlFor={form.nameInputId}>Name</FieldLabel>
        <Input id={form.nameInputId} name="name" defaultValue={form.name} required />
      </Field>
      <Field>
        <FieldLabel htmlFor={form.descriptionInputId}>Description</FieldLabel>
        <Textarea id={form.descriptionInputId} name="description" defaultValue={form.description} />
      </Field>
      <Field>
        <FieldLabel>Linked groups</FieldLabel>
        <div className="max-h-48 space-y-2 overflow-auto rounded-lg border p-3">
          {groups.map((group) => (
            <label key={group.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="groupIds"
                value={group.id}
                defaultChecked={form.groupIds.has(group.id)}
                className="size-4"
              />
              <span className="truncate">
                {group.kindName}: {group.name}
              </span>
            </label>
          ))}
        </div>
      </Field>
      <ActionMessage state={state} />
      <SubmitButton>{form.submitLabel}</SubmitButton>
    </>
  )
}

function PositionHolderFields({
  form,
  state,
  users,
}: {
  form: PositionForm
  state: AdminActionState
  users: AdminDashboardData['users']
}) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <input type="hidden" name="positionId" value={form.id} />
      <Field>
        <FieldLabel htmlFor={form.holderInputId}>Current holder</FieldLabel>
        <NativeSelect id={form.holderInputId} name="userId" className="w-full" defaultValue={form.currentHolderUserId}>
          {users.map((user) => (
            <NativeSelectOption key={user.id} value={user.id}>
              {user.name} ({user.email})
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <ActionMessage state={state} />
      <SubmitButton variant="outline">Set holder</SubmitButton>
    </div>
  )
}
