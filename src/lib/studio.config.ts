import type { StudioConfig } from 'better-auth-studio'

import { auth } from '@/lib/auth'

const config: StudioConfig = {
  auth,
  basePath: '/api/studio',
  access: {
    roles: ['admin'],
  },
  metadata: {
    title: 'CSK Admin',
    theme: 'dark',
    colors: { primary: '#0ea5e9' },
    company: { name: 'CSK', supportEmail: 'webmästeriet@choir.chs.chalmers.se' },
    features: { organizations: false },
  },
  tools: {
    exclude: ['test-oauth', 'oauth-credentials'],
  },
}

export default config
