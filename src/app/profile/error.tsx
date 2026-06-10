'use client';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto my-16 w-full max-w-2xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile unavailable</CardTitle>
          <CardDescription>Something went wrong while loading your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} type="button" variant="outline">
            <RotateCcw data-icon="inline-start" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
