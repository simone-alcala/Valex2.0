import { Router } from 'express';

import * as controller from './../controllers/paymentsController.js';
import { idSchema } from './../schemas/idParamSchema.js';
import { insert } from './../schemas/paymentsSchema.js';
import * as validateSchema from './../middlewares/validateSchemaMiddleware.js';

const paymentsRouter = Router();

paymentsRouter.post('/payments/:id'
  , validateSchema.validateParamSchemaMiddleware(idSchema)
  , validateSchema.validateSchemaMiddleware(insert)
  , controller.insert);

export default paymentsRouter;