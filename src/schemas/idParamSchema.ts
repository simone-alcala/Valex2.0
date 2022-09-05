import Joi from 'joi';

export const idSchema = Joi.object({
  id: Joi.string().pattern(new RegExp('^[0-9]+$')).required()
});
