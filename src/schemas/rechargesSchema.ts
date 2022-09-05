import Joi from 'joi';

export const amount = Joi.object({
  amount: Joi.number().integer().positive().required()
});
