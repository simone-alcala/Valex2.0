import Joi from 'joi';
import { insertControllerPayment } from './../services/paymentsService.js';

export const insert = Joi.object<insertControllerPayment>({
  businessId: Joi.number().integer().positive().required(), 
  password: Joi.string().pattern(new RegExp('^[0-9]{4}$')).required(),
  amount: Joi.number().integer().positive().required()
});

