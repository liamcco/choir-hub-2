import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="max-w-2xl mx-auto my-20 text-center space-y-6">
      <h1 className="text-2xl font-bold">Welcome to CSK Choir Hub</h1>
      {session ? (
        <p>
          You are signed in as <strong>{session.user.email}</strong>.
        </p>
      ) : (
        <p>You are not signed in. Please sign in to access protected resources.</p>
      )}
    </div>
  );
}
