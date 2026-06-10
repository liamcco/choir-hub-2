import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function MySession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Simulate a delay for demonstration purposes
  await new Promise((resolve) => setTimeout(resolve, 500));

  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardContent>
        <p>This is the session component.</p>
        <p>{session?.user?.email}</p>
      </CardContent>
    </Card>
  );
}

export function MySessionSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardContent>
        <p>This is the session component.</p>
        <Skeleton className="h-5 w-48" />
      </CardContent>
    </Card>
  );
}
