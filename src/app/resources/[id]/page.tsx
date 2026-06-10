'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getResourceByIdOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function ResourceDetailSkeleton() {
  return (
    <Card className="mx-auto w-full sm:max-w-md">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, error, isPending, refetch } = useQuery(getResourceByIdOptions({ path: { id: params.id } }));

  return (
    <div className="mx-auto w-full px-8">
      <div className="m-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resource Detail</h1>
          <p className="text-sm text-muted-foreground">View details for a protected resource.</p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/resources">Back to resources</Link>}
        ></Button>
      </div>

      {isPending ? <ResourceDetailSkeleton /> : null}

      {error ? (
        <Card className="mx-auto w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Could not load resource</CardTitle>
            <CardDescription>Something went wrong while fetching this resource.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">{error.message}</p>
            <Button type="button" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {data && !isPending ? (
        <Card className="mx-auto w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>{data.name}</CardTitle>
            <CardDescription>{data.description || 'No description provided.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">ID</p>
              <p className="text-muted-foreground break-all">{data.id}</p>
            </div>
            <div>
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">{new Date(data.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Updated</p>
              <p className="text-muted-foreground">{new Date(data.updatedAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
