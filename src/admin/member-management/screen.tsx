import { LockIcon, SaveIcon, UnlockIcon, UserPlusIcon } from 'lucide-react'
import {
  createLinkedMemberAction,
  createMemberAccountAction,
  updateAccountAccessAction,
  updateMemberStatusAction,
} from '@/admin/member-management/actions'
import type { ManagedMemberAccount } from '@/admin/member-management/service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MemberStatus } from '@/prisma/generated/client'

export function MemberManagementScreen({ accounts }: { accounts: ManagedMemberAccount[] }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Members</h1>
        <p className="text-muted-foreground text-sm">Account access and overall Member Status</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(18rem,24rem)_1fr] lg:items-start">
        <CreateMemberAccountCard />
        <ManagedAccountsCard accounts={accounts} />
      </section>
    </main>
  )
}

function CreateMemberAccountCard() {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>User account with linked skeletal Member</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createMemberAccountAction} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" name="name" autoComplete="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Temporary password</FieldLabel>
              <Input id="password" name="password" type="password" minLength={8} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Member Status</FieldLabel>
              <MemberStatusSelect id="status" name="status" className="w-full" defaultValue={MemberStatus.ACTIVE} />
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-fit">
            <UserPlusIcon data-icon="inline-start" />
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function ManagedAccountsCard({ accounts }: { accounts: ManagedMemberAccount[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>{accounts.length} total</CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Access</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <ManagedAccountRow key={account.user.id} account={account} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ManagedAccountRow({ account }: { account: ManagedMemberAccount }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-52 flex-col gap-0.5">
          <span className="font-medium">{account.user.name}</span>
          <span className="text-muted-foreground text-xs">{account.user.email}</span>
        </div>
      </TableCell>
      <TableCell>
        {account.linkState === 'linked' ? (
          <span className="font-mono text-xs">{account.member.id}</span>
        ) : (
          <Badge variant="outline">No Member</Badge>
        )}
      </TableCell>
      <TableCell>
        {account.linkState === 'linked' ? (
          <form action={updateMemberStatusAction.bind(null, account.member.id)} className="flex gap-2">
            <MemberStatusSelect
              name="status"
              size="sm"
              defaultValue={account.member.status}
              aria-label={`${account.user.name} Member Status`}
            />
            <Button type="submit" variant="outline" size="icon-sm" aria-label="Save Member Status">
              <SaveIcon />
            </Button>
          </form>
        ) : (
          <form action={createLinkedMemberAction.bind(null, account.user.id)} className="flex gap-2">
            <MemberStatusSelect
              name="status"
              size="sm"
              defaultValue={MemberStatus.ACTIVE}
              aria-label={`${account.user.name} initial Member Status`}
            />
            <Button type="submit" variant="outline" size="sm">
              <UserPlusIcon data-icon="inline-start" />
              Link Member
            </Button>
          </form>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={account.accessState === 'enabled' ? 'secondary' : 'destructive'}>
          {account.accessState === 'enabled' ? 'Enabled' : 'Disabled'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <form action={updateAccountAccessAction.bind(null, account.user.id)} className="inline-flex justify-end">
          <input type="hidden" name="accessState" value={account.accessState === 'enabled' ? 'disabled' : 'enabled'} />
          <Button type="submit" variant={account.accessState === 'enabled' ? 'destructive' : 'outline'} size="sm">
            {account.accessState === 'enabled' ? (
              <LockIcon data-icon="inline-start" />
            ) : (
              <UnlockIcon data-icon="inline-start" />
            )}
            {account.accessState === 'enabled' ? 'Disable' : 'Enable'}
          </Button>
        </form>
      </TableCell>
    </TableRow>
  )
}

function MemberStatusSelect({ className, ...props }: Omit<React.ComponentProps<typeof NativeSelect>, 'children'>) {
  return (
    <NativeSelect className={className} {...props}>
      {memberStatusOptions.map((status) => (
        <NativeSelectOption key={status} value={status}>
          {formatMemberStatus(status)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

const memberStatusOptions = [MemberStatus.ACTIVE, MemberStatus.PASSIVE, MemberStatus.FORMER]

function formatMemberStatus(status: MemberStatus) {
  switch (status) {
    case MemberStatus.ACTIVE:
      return 'Active'
    case MemberStatus.PASSIVE:
      return 'Passive'
    case MemberStatus.FORMER:
      return 'Former'
  }
}
