import { Router } from 'express';

import cardsRouter from './cardsRouter.js';
import rechargesRouter from './rechargesRouter.js';
import paymentsRouter from './paymentsRouter.js';
import documentationRouter from './documentationRouter.js';

const router = Router();
router.use(cardsRouter);
router.use(rechargesRouter);
router.use(paymentsRouter);
router.use(documentationRouter);

export default router;