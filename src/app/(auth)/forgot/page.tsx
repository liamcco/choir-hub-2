import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { PageShell } from '@/components/layout/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { ForgotPasswordForm } from './forgot-password-form';

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/');
  }

  return (
    <PageShell size="narrow" className="py-16 sm:py-20">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-zinc-500">CSK Choir Hub</p>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Use the reset code from the server console.</CardDescription>
        </CardHeader>

        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </PageShell>
  );
}
