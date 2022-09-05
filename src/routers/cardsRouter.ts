import { Router } from 'express';

import * as controller from './../controllers/cardsController.js';
import validateToken from '../middlewares/validateTokenMiddleware.js';
import { idSchema } from './../schemas/idParamSchema.js';
import * as schema from './../schemas/cardsSchema.js';
import * as validateSchema from './../middlewares/validateSchemaMiddleware.js';

const cardsRouter = Router();

cardsRouter.post('/cards'                 
  , validateToken
  , validateSchema.validateSchemaMiddleware(schema.insert)
  , controller.insert);
cardsRouter.put ('/cards/activate/:id'    
  , validateSchema.validateParamSchemaMiddleware(idSchema)
  , validateSchema.validateSchemaMiddleware(schema.activate)
  , controller.activate);
cardsRouter.put ('/cards/block/:id'       
  , validateSchema.validateParamSchemaMiddleware(idSchema)
  , validateSchema.validateSchemaMiddleware(schema.password)
  , controller.block);
cardsRouter.put ('/cards/unblock/:id'     
  , validateSchema.validateParamSchemaMiddleware(idSchema)
  , validateSchema.validateSchemaMiddleware(schema.password)
  , controller.unblock);
cardsRouter.get ('/cards/transactions/:id'
  , validateSchema.validateParamSchemaMiddleware(idSchema)
  , controller.getTransactions);

export default cardsRouter;