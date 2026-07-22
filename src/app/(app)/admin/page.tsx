import { redirect } from 'next/navigation'
import { ROUTES } from '@/core/navigation/site'

export default async function AdminHomePage() {
  redirect(ROUTES.adminMembers)
}
