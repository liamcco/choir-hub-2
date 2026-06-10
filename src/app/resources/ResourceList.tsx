import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Resource {
  id: string;
  name: string;
  description: string | null;
}

interface ResourceListProps {
  resources: Resource[];
}

export default function ResourceList({ resources }: ResourceListProps) {
  return (
    <div className="w-full mx-auto px-8">
      <div className="m-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-sm text-muted-foreground">List of protected resources</p>
      </div>

      {resources.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">No resources found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => (
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
      )}
    </div>
  );
}
