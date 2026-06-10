'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { createResourceMutation } from '@/lib/api-client/@tanstack/react-query.gen';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import z from 'zod';

const createResourceFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim(),
});

export default function CreatePage() {
  const mutation = useMutation(createResourceMutation());

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onSubmit: createResourceFormSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        body: {
          name: value.name.trim(),
          description: value.description.trim() || undefined,
        },
      });

      form.reset();
    },
  });

  const errorMessage = mutation.error?.message;
  const isSaving = mutation.isPending || form.state.isSubmitting;

  return (
    <Card className="w-full sm:max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Resource</CardTitle>
        <CardDescription>If you ever need more resources.</CardDescription>
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
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />

                  {field.state.meta.isTouched && field.state.meta.errors.length ? (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors.map((error) => error?.message).join(', ')}
                    </p>
                  ) : null}
                </Field>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>

                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    disabled={isSaving}
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />

                  {field.state.meta.isTouched && field.state.meta.errors.length ? (
                    <p className="text-sm text-red-600">
                      {field.state.meta.errors.map((error) => error?.message).join(', ')}
                    </p>
                  ) : null}
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button variant="default" disabled={!canSubmit || isSubmitting || isSaving} type="submit">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>

        {errorMessage ? <p className="mt-4 text-sm text-red-700">{errorMessage}</p> : null}

        {mutation.isPending ? (
          <Card className="mt-4">
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ) : null}

        {mutation.data && !mutation.isPending ? (
          <Card className="mt-4">
            <CardContent>
              <p className="font-medium text-green-700">Resource created successfully.</p>
              <p className="mt-2 font-medium">{mutation.data.name}</p>
              {mutation.data.description ? <p className="mt-1 text-zinc-600">{mutation.data.description}</p> : null}
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  );
}
