import { notFound } from 'next/navigation'
import { DevLoginForm } from '@/app/login/dev-login-form'
import { isProduction } from '@/common/environment/environment'

export default function LoginPage() {
  if (isProduction) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Dev login</h1>
          <p className="text-muted-foreground text-sm">Local email/password sign-in for testing</p>
        </div>
        <DevLoginForm />
      </div>
    </main>
  )
}
