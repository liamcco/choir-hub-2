'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, UserPlus } from 'lucide-react';
import { useState } from 'react';
import z from 'zod';

import {
  getPeopleOptions,
  getPeopleQueryKey,
  provisionPeopleMutation,
} from '@/lib/api-client/@tanstack/react-query.gen';
import type { GetPeopleResponse } from '@/lib/api-client/types.gen';

import { parsePeopleCsv } from '@/common/csv/utils';
import { getErrorMessage } from '@/common/errors/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const provisionFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Email must be valid'),
  password: z
    .string()
    .max(128, 'Password is too long')
    .refine((password) => !password || password.length >= 8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']),
});

type ProvisionFormValues = z.infer<typeof provisionFormSchema>;
type People = GetPeopleResponse['people'];

const defaultProvisionFormValues: ProvisionFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'user',
};

export function AdminPeoplePanel() {
  const queryClient = useQueryClient();
  const peopleQuery = useQuery(getPeopleOptions());
  const provisionMutation = useMutation(provisionPeopleMutation());
  const [csvError, setCsvError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: defaultProvisionFormValues,
    validators: {
      onSubmit: provisionFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await provisionMutation.mutateAsync({
          body: {
            people: [
              {
                name: value.name.trim(),
                email: value.email.trim(),
                password: value.password.trim() || undefined,
                role: value.role,
              },
            ],
          },
        });

        form.reset();
        await queryClient.invalidateQueries({ queryKey: getPeopleQueryKey() });
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  });

  const isSaving = provisionMutation.isPending || form.state.isSubmitting;
  const provisionError = getErrorMessage(provisionMutation.error);

  async function handleCsvUpload(file: File | undefined) {
    setCsvError(null);

    if (!file) {
      return;
    }

    try {
      const rows = parsePeopleCsv(await file.text());

      await provisionMutation.mutateAsync({
        body: {
          people: rows.map((row) => ({
            name: row.name,
            email: row.email,
            role: 'user',
          })),
        },
      });

      await queryClient.invalidateQueries({ queryKey: getPeopleQueryKey() });
    } catch (error) {
      setCsvError(getErrorMessage(error) ?? 'Could not import CSV.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create Person</CardTitle>
          <CardDescription>Provision a Better Auth user and matching application person.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      disabled={isSaving}
                      autoComplete="name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      disabled={isSaving}
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Temporary password optional</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      disabled={isSaving}
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="role">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <select
                      id={field.name}
                      name={field.name}
                      disabled={isSaving}
                      className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value as 'user' | 'admin')}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button disabled={!canSubmit || isSubmitting || isSaving} type="submit">
                    <UserPlus />
                    {isSaving ? 'Creating...' : 'Create'}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>

          {provisionError ? <p className="mt-4 text-sm text-destructive">{provisionError}</p> : null}
          <ProvisionResult result={provisionMutation.data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
          <CardDescription>Create ordinary users from name and email columns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="people-csv">CSV file</FieldLabel>
            <Input
              id="people-csv"
              type="file"
              accept=".csv,text/csv"
              disabled={isSaving}
              onChange={(event) => {
                void handleCsvUpload(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <FieldDescription>Rows with existing emails are skipped.</FieldDescription>
            {csvError ? <FieldError>{csvError}</FieldError> : null}
          </Field>
        </CardContent>
      </Card>

      <Card className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <CardHeader className="grid-cols-[1fr_auto]">
          <div>
            <CardTitle>Persons</CardTitle>
            <CardDescription>{peopleQuery.data?.people.length ?? 0} provisioned</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            type="button"
            title="Refresh"
            aria-label="Refresh"
            disabled={peopleQuery.isFetching}
            onClick={() => peopleQuery.refetch()}
          >
            <RefreshCw className={peopleQuery.isFetching ? 'animate-spin' : undefined} />
          </Button>
        </CardHeader>
        <CardContent>
          <PeopleList
            people={peopleQuery.data?.people ?? []}
            isPending={peopleQuery.isPending}
            error={peopleQuery.error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProvisionResult({ result }: { result: unknown }) {
  if (!isProvisionResult(result)) {
    return null;
  }

  const total = result.succeeded.length + result.skipped.length + result.failed.length;

  if (!total) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 text-sm">
      <p className="font-medium text-green-700">
        Created {result.succeeded.length}. Skipped {result.skipped.length}. Failed {result.failed.length}.
      </p>
      {result.skipped.length ? (
        <p className="text-muted-foreground">Skipped: {result.skipped.map((person) => person.email).join(', ')}</p>
      ) : null}
      {result.failed.length ? (
        <p className="text-destructive">
          Failed: {result.failed.map((person) => `${person.email} (${person.message})`).join(', ')}
        </p>
      ) : null}
    </div>
  );
}

function isProvisionResult(result: unknown): result is {
  succeeded: Array<{ user: { email: string } }>;
  skipped: Array<{ email: string; message: string }>;
  failed: Array<{ email: string; message: string }>;
} {
  return (
    typeof result === 'object' &&
    result !== null &&
    'succeeded' in result &&
    'skipped' in result &&
    'failed' in result &&
    Array.isArray(result.succeeded) &&
    Array.isArray(result.skipped) &&
    Array.isArray(result.failed)
  );
}

function PeopleList({ people, isPending, error }: { people: People; isPending: boolean; error: unknown }) {
  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const errorMessage = getErrorMessage(error);
  if (errorMessage) {
    return <p className="text-sm text-destructive">{errorMessage}</p>;
  }

  if (!people.length) {
    return <p className="text-sm text-muted-foreground">No persons provisioned.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-150 text-left text-sm">
        <thead className="border-b text-xs text-muted-foreground uppercase">
          <tr>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 pr-4 font-medium">Person ID</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {people.map((person) => (
            <tr key={person.id}>
              <td className="py-3 pr-4 font-medium">{person.user?.name ?? 'Missing user'}</td>
              <td className="py-3 pr-4 text-muted-foreground">{person.user?.email ?? '-'}</td>
              <td className="py-3 pr-4 text-muted-foreground">{person.user?.role ?? '-'}</td>
              <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{person.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
