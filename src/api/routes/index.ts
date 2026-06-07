import { Hono } from 'hono';

import healthRoute from './health';
import protectedRoute from './resources';

const router = new Hono();

router.route('/health', healthRoute);
router.route('/resources', protectedRoute);

export default router;
