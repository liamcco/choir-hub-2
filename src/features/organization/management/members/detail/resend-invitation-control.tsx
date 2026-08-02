import { ResendInvitationForm } from './resend-invitation-form'

export function ResendInvitationControl({
  action,
  userId,
}: {
  userId: string
  action: (userId: string) => Promise<{ success: boolean; message: string }>
}) {
  return <ResendInvitationForm action={action} userId={userId} />
}
