'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isPending || !session) {
    return null;
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      queryClient.removeQueries();
      await refetch();
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button disabled={isSigningOut} onClick={handleSignOut} type="button">
      {isSigningOut ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
