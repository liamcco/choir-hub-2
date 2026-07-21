import { passkeyClient } from '@better-auth/passkey/client'
import { adminClient, emailOTPClient, twoFactorClient, usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { adminPluginOptions } from '@/core/auth/permissions'

export const authClient = createAuthClient({
  plugins: [twoFactorClient(), usernameClient(), emailOTPClient(), passkeyClient(), adminClient(adminPluginOptions)],
})
