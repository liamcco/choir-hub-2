import { Hono } from 'hono';

import peopleRoute from './people';

const router = new Hono();

router.route('/people', peopleRoute);

export default router;
