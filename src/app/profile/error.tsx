'use client'

import { RotateCcw } from 'lucide-react'

import { PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <PageShell size="content" className="py-16">
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
    </PageShell>
  )
}
