'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data, isPending: isLoadingSession } = authClient.useSession();

  if (isLoadingSession) {
    return (
      <Button variant="default" disabled>
        <Spinner />
      </Button>
    );
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
      },
    });

    setIsSigningOut(false);
  };

  if (!data) {
    return <Button variant="default" render={<Link href="/login">Sign in</Link>}></Button>;
  }

  return (
    <Button aria-busy={isSigningOut} disabled={isSigningOut} variant="default" type="button" onClick={handleSignOut}>
      {isSigningOut ? (
        <>
          <Spinner />
          <span>Signing out...</span>
        </>
      ) : (
        'Sign out'
      )}
    </Button>
  );
}
