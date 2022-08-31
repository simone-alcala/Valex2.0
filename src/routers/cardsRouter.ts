import { Router } from 'express';
import * as schema from './../schemas/cardsSchema.js';
import validateToken from '../middlewares/validateTokenMiddleware.js';
import validateSchemaMiddleware from './../middlewares/validateSchemaMiddleware.js';
import * as cards from './../controllers/cardsController.js';

const cardsRouter = Router();

cardsRouter.post('/cards', validateToken, validateSchemaMiddleware(schema.insert), cards.insert);
cardsRouter.put ('/cards/activate/:id', validateSchemaMiddleware(schema.activate), cards.activate);
cardsRouter.put ('/cards/block/:id', validateSchemaMiddleware(schema.idPwd), cards.block);
cardsRouter.put ('/cards/unblock/:id', validateSchemaMiddleware(schema.idPwd), cards.unblock);
cardsRouter.get ('/cards/:id', validateSchemaMiddleware(schema.idPwd), cards.findByEmployee);
cardsRouter.get ('/cards/transactions/:id', cards.getTransactions);

export default cardsRouter;