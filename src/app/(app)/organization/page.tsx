import { redirect } from 'next/navigation'
import { getCurrentAccessActor } from '@/admin/actor'
import { ROUTES } from '@/lib/route-access'
import { getOrganizationalReadOnlyService } from '@/organization-read/runtime'
import { OrganizationalReadOnlyScreen } from '@/organization-read/screen'
import { OrganizationalReadOnlyAuthorizationError } from '@/organization-read/service'

export const instant = false

export default async function OrganizationPage() {
  const actor = await getCurrentAccessActor()
  if (!actor) {
    redirect(ROUTES.login)
  }

  try {
    const service = await getOrganizationalReadOnlyService()
    const state = await service.listOrganizationalReadOnly(actor)
    return <OrganizationalReadOnlyScreen state={state} />
  } catch (error) {
    if (error instanceof OrganizationalReadOnlyAuthorizationError) {
      redirect(ROUTES.login)
    }
    throw error
  }
}
