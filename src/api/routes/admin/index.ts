import { Hono } from 'hono'

import type { ApiEnv } from '@/api/context'
import { requireAdmin } from '@/api/middleware/auth'

import groupsRouter from './groups'
import groupKindsRouter from './group-kinds'
import positionsRouter from './positions'
import usersRouter from './users'

const router = new Hono<ApiEnv>()

router.use('*', requireAdmin)

router.route('/group-kinds', groupKindsRouter)
router.route('/groups', groupsRouter)
router.route('/users', usersRouter)
router.route('/positions', positionsRouter)

export default router
