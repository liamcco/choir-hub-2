import { Suspense } from 'react';
import { CalendarDays, Mail, UserCircle } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';

import { EmailVerificationForm } from './email-verification-form';
import { PasskeyManager } from './passkey-manager';
import { UsernameForm } from './username-form';

export default function ProfilePage() {
  return (
    <PageShell size="content">
      <PageHeader title="Profile" description="Manage your account identity and sign-in options." />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Suspense fallback={<ProfileCardSkeleton />}>
            <ProfileCard />
          </Suspense>
        </TabsContent>

        <TabsContent value="security">
          <Suspense fallback={<SecurityCardSkeleton />}>
            <SecurityCard />
          </Suspense>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

async function ProfileCard() {
  const { session } = await getSessionOrRedirect();
  const user = session.user;
  const userFields = user as typeof user & Record<string, unknown>;
  const username = toNonEmptyString(userFields.username);
  const displayUsername = toNonEmptyString(userFields.displayUsername);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your personal profile details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <ProfileFact icon={<UserCircle className="size-4" />} label="Name" value={user.name} />
          <ProfileFact icon={<Mail className="size-4" />} label="Email" value={user.email} />
          <ProfileFact icon={<CalendarDays className="size-4" />} label="Joined" value={formatDate(user.createdAt)} />
        </div>

        <div className="grid gap-4">
          <EmailVerificationForm email={user.email} emailVerified={user.emailVerified} />
          <UsernameForm displayUsername={displayUsername} username={username} />
        </div>
      </CardContent>
    </Card>
  );
}

async function SecurityCard() {
  const { requestHeaders } = await getSessionOrRedirect();
  const passkeys = await auth.api.listPasskeys({
    headers: requestHeaders,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Add a passkey to sign in with your device lock or security key.</CardDescription>
      </CardHeader>
      <CardContent>
        <PasskeyManager passkeys={passkeys} />
      </CardContent>
    </Card>
  );
}

function ProfileFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function ProfileCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-28" />
        <Skeleton className="h-32" />
      </CardContent>
    </Card>
  );
}

function SecurityCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        <Skeleton className="h-20" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24" />
      </CardContent>
    </Card>
  );
}

async function getSessionOrRedirect() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect('/login');
  }

  return { requestHeaders, session };
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString();
}

function toNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
