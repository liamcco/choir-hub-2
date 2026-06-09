'use client';

import { useActionState } from 'react';
import { Spinner } from '@/components/ui/spinner';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/auth-actions';

export function SignOutButton() {
  const [, action, isPending] = useActionState(signOutAction, null);

  return (
    <form action={action}>
      <Button aria-busy={isPending} disabled={isPending} type="submit">
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
