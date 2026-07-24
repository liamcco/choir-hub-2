import { MemberAccountForm } from './member-account-form'

export function MemberCreate({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="mx-auto w-full max-w-xl space-y-6">
      {showHeading ? (
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Users</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">Create a User and set their initial Member Status.</p>
        </header>
      ) : (
        <p className="text-muted-foreground">Create a User and set their initial Member Status.</p>
      )}
      <div className="rounded-lg border p-4 sm:p-6">
        <MemberAccountForm />
      </div>
    </section>
  )
}
