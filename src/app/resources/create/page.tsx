'use client';

import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import type { PostApiResourcesError } from '@/lib/api-client';
import { postApiResourcesMutation } from '@/lib/api-client/@tanstack/react-query.gen';
import { getApiErrorMessage } from '@/lib/errors';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import z from 'zod';

export default function CreatePage() {
  const mutation = useMutation(postApiResourcesMutation());

  const createResourceFormSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onSubmit: createResourceFormSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        body: {
          name: value.name,
          description: value.description || undefined,
        },
      });
    },
  });

  const errorMessage = getApiErrorMessage<PostApiResourcesError>(mutation.error);

  return (
    <Card className="w-full sm:max-w-md">
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />

                  {field.state.meta.errors.length ? (
                    <p className="text-red-600">{field.state.meta.errors.map((error) => error?.message).join(', ')}</p>
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />

                  {field.state.meta.errors.length ? (
                    <p className="text-red-600">{field.state.meta.errors.map((error) => error?.message).join(', ')}</p>
                  ) : null}
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button variant="default" disabled={!canSubmit || isSubmitting || mutation.isPending} type="submit">
                  {mutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>

        {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}

        {mutation.data ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
            <p className="font-medium">{mutation.data.name}</p>
            <p className="mt-1 text-zinc-600">{mutation.data.description}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
