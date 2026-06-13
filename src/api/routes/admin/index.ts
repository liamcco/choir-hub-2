import { Hono } from 'hono'

import groupsRouter from './groups'
import groupKindsRouter from './groups/kinds'
import positionsRouter from './positions'
import usersRouter from './users'

const router = new Hono()

router.route('/group-kinds', groupKindsRouter)
router.route('/groups', groupsRouter)
router.route('/users', usersRouter)
router.route('/positions', positionsRouter)

export default router
