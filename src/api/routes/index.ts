import { Hono } from 'hono';

import adminRoute from './admin';
import healthRoute from './health';
import resourcesRoute from './resources';

const router = new Hono();

router.route('/admin', adminRoute);
router.route('/health', healthRoute);
router.route('/resources', resourcesRoute);

export default router;
