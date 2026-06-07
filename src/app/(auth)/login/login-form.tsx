"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { signInAction } from "./actions";
export function LoginForm({ action }: { action: typeof signInAction }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            required
            type="email"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            autoComplete="current-password"
            id="password"
            name="password"
            required
            type="password"
          />
        </Field>
      </FieldGroup>

      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button 
      className="my-2 w-full"
      disabled={pending} 
      type="submit"
      variant="default">
        {pending ? 
        "Signing in..." 
        : "Sign in"}
      </Button>
    </form>
  );
}