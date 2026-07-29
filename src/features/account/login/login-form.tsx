'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { focusField } from '@/shared/forms/focus'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { loginSchema } from './schemas'
import { signInWithEmailPassword } from './service'

type LoginFormState = FormState<typeof loginSchema>
const initialState: LoginFormState = {}

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('') // For persitance across form submissions

  async function submitLogin(_previousState: LoginFormState, formData: FormData): Promise<LoginFormState> {
    const validatedFormData = parseFormData(loginSchema, formData)

    if (!validatedFormData.success) {
      focusField(validatedFormData.fieldErrors.email ? 'email' : 'password')
      return { fieldErrors: validatedFormData.fieldErrors }
    }

    const result = await signInWithEmailPassword({
      email: validatedFormData.data.email,
      password: validatedFormData.data.password,
      rememberMe: formData.get('rememberMe') === 'on',
      returnTo,
    })

    if (!result.success) {
      return { success: false, message: result.error }
    }

    router.replace(result.redirectTo)
    return initialState
  }

  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(submitLogin, initialState)
  const emailError = state.fieldErrors?.email?.[0]
  const passwordError = state.fieldErrors?.password?.[0]

  return (
    <form action={formAction} noValidate aria-busy={isPending} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!emailError}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
            }}
            data-invalid={!!emailError}
          />
          <FieldError>{emailError}</FieldError>
        </Field>
        <Field data-invalid={!!passwordError}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            data-invalid={!!passwordError}
          />
          <FieldError>{passwordError}</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="rememberMe" name="rememberMe" />
          <FieldLabel htmlFor="rememberMe" className="font-normal" defaultChecked>
            Keep me signed in
          </FieldLabel>
        </Field>
        {state.message ? (
          <Field>
            <FieldError id="login-error">{state.message}</FieldError>
          </Field>
        ) : null}
      </FieldGroup>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
      <Link href={ROUTES.forgotPassword} className="text-center text-sm underline underline-offset-4">
        Forgot your password?
      </Link>
    </form>
  )
}
