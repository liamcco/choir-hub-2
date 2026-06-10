'use client';

import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getResourcesOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import Link from 'next/link';

export default function ResourcesCard() {
  const { data, error, isPending, refetch } = useQuery(getResourcesOptions());

  return (
    <div className="w-full mx-auto px-8">
      <div className="m-6">
        <h1 className="text-2xl font-bold">Resources fetched with Tanstack Query</h1>
        <p className="text-sm text-muted-foreground">Call was made from the client-side</p>
      </div>

      {isPending ? <ResourceCardSkeletonGrid /> : null}

      {error ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">Error fetching protected data: {error.message}</p>
          <Button size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {data && !isPending ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {data.resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader className="flex justify-between space-y-2">
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                  <Link href={`/resources/${resource.id}`} className="text-sm text-primary">
                    View Details
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResourceCardSkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
