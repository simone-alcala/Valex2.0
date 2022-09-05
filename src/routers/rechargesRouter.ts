import { Router } from 'express';

import * as controller from './../controllers/rechargesController.js';
import validateToken from '../middlewares/validateTokenMiddleware.js';
import { idSchema } from './../schemas/idParamSchema.js';
import { amount } from './../schemas/rechargesSchema.js';
import * as validateSchema from './../middlewares/validateSchemaMiddleware.js';

const rechargesRouter = Router();

rechargesRouter.post('/recharges/:id'
  , validateToken
  , validateSchema.validateParamSchemaMiddleware(idSchema)
  , validateSchema.validateSchemaMiddleware(amount)
  , controller.insert);

export default rechargesRouter;