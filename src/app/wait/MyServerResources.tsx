import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getResources } from '@/services/resourceService';

export async function MyServerResources() {
  const resources = await getResources();

  // Simulate a delay for demonstration purposes
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <Card>
      <CardContent>
        <p>This is the server resources component.</p>
        <p>{resources.length} resources found.</p>
      </CardContent>
    </Card>
  );
}

export function MyServerResourcesSkeleton() {
  return (
    <Card>
      <CardContent>
        <p>This is the server resources component.</p>
        <Skeleton className="h-5 w-48" />
      </CardContent>
    </Card>
  );
}
