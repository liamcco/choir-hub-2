import { Hono } from 'hono'

import groupKindsRoute from './groups/kinds'
import groupsRoute from './groups'
import peopleRoute from './people'
import positionsRoute from './positions'

const router = new Hono()

router.route('/group-kinds', groupKindsRoute)
router.route('/groups', groupsRoute)
router.route('/people', peopleRoute)
router.route('/positions', positionsRoute)

export default router
