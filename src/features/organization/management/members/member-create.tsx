import { MemberAccountForm } from './member-account-form'

export function MemberCreate({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="mx-auto w-full max-w-xl space-y-6">
      {showHeading ? (
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Members</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create Member</h1>
          <p className="text-muted-foreground">Create an Auth User and its linked skeletal Member together.</p>
        </header>
      ) : (
        <p className="text-muted-foreground">Create an Auth User and its linked skeletal Member together.</p>
      )}
      <div className="rounded-lg border p-4 sm:p-6">
        <MemberAccountForm />
      </div>
    </section>
  )
}
