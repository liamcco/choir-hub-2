import { Hono } from 'hono'

import adminRoute from './admin'

const router = new Hono()

router.route('/admin', adminRoute)

export default router
