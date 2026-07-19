import { headers } from 'next/headers'
import { createBetterAuthPasswordChangeGateway } from '@/account-self-service/better-auth-password-gateway'
import { createAccountSelfService } from '@/account-self-service/service'

export async function getAccountSelfService() {
  return createAccountSelfService({
    passwordGateway: createBetterAuthPasswordChangeGateway(await headers()),
  })
}
