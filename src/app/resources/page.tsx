"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getApiResourcesOptions } from "@/lib/api-client/@tanstack/react-query.gen";

export default function ResourcesPage() {
  const { data, error, isPending, refetch } = useQuery(
    getApiResourcesOptions(),
  );

  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle>Protected resources</CardTitle>
        <CardDescription>
          Data available only to authenticated users.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <p className="text-sm text-muted-foreground">
            Loading protected data...
          </p>
        ) : null}

        {error ? (
          <div className="space-y-4">
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error.message}
            </p>

            <div className="flex items-center gap-2">
              {error.message === "Unauthorized" ? (
                <Link href="/login">Sign in</Link>
              ) : null}

              <Button
                disabled={isPending}
                onClick={() => refetch()}
                type="button"
                variant="outline"
              >
                {isPending ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </div>
        ) : null}

        {data ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {resource.name}
                    </CardTitle>
                    <CardDescription>
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}