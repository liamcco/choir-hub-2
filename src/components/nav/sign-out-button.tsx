'use client';

import { Spinner } from '@/components/ui/spinner';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/auth-actions';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export function SignOutButton() {
  const [, action, isSigningOut] = useActionState(signOutAction, null);
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Button variant="default" disabled>
        <Spinner />
      </Button>
    );
  }

  if (!data) {
    return (
      <Link href="/login">
        <Button variant="default">Sign in</Button>
      </Link>
    );
  }

  return (
    <form action={action}>
      <Button aria-busy={isSigningOut} disabled={isSigningOut} variant="default" type="submit">
        {isPending ? (
          <>
            <Spinner />
            <span>Signing out...</span>
          </>
        ) : (
          'Sign out'
        )}
      </Button>
    </form>
  );
}
