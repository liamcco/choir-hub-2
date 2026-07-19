import type { PasswordChangeGateway } from '@/account-self-service/service'
import { auth } from '@/lib/auth'

export function createBetterAuthPasswordChangeGateway(requestHeaders: Headers): PasswordChangeGateway {
  return {
    async changePassword(input) {
      await auth.api.changePassword({
        headers: requestHeaders,
        body: input,
      })
    },
  }
}
