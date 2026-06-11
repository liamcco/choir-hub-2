import type { StudioConfig } from 'better-auth-studio'

import { auth } from '@/lib/auth'
import { prisma } from '@/db'

const config: StudioConfig = {
  auth,
  basePath: '/api/studio',
  access: {
    roles: ['admin'],
  },
  events: {
    enabled: true,
    client: prisma,
    clientType: 'prisma',
    tableName: 'auth_events',
  },
  metadata: {
    title: 'CSK Admin',
    theme: 'dark',
    colors: { primary: '#0ea5e9' },
    company: { name: 'CSK', supportEmail: 'webmästeriet@choir.chs.chalmers.se' },
  },
}

export default config
