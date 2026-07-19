import { LoginForm } from './login-form'

export default function LoginPage() {
  return <LoginScreen form={<LoginForm />} />
}

export function LoginScreen({ form }: { form: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Sign in</h1>
          <p className="text-muted-foreground text-sm">Use your choir account email and password</p>
        </div>
        {form}
      </div>
    </main>
  )
}
