export function PasswordResetScreenLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main
      aria-labelledby="password-reset-title"
      aria-describedby="password-reset-description"
      className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8"
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 id="password-reset-title" className="font-semibold text-2xl tracking-normal">
            {title}
          </h1>
          <p id="password-reset-description" className="text-muted-foreground text-sm">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  )
}
