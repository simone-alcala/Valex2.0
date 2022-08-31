import Joi from 'joi';
import { insertControllerType, activateControllerType } from './../services/cardsService.js';

export const insert = Joi.object<insertControllerType>({
  employeeId: Joi.number().integer().required(),
  cardType: Joi.valid('groceries', 'restaurant', 'transport', 'education', 'health').required()
});

export const activate = Joi.object<activateControllerType>({
  cardId: Joi.string().pattern(new RegExp('^[0-9]+$')).required(),
  cvv: Joi.string().pattern(new RegExp('^[0-9]{3}$')).required(),
  password: Joi.string().pattern(new RegExp('^[0-9]{4}$')).required()
});

export const idPwd = Joi.object({
  id: Joi.string().pattern(new RegExp('^[0-9]+$')).required(),
  password: Joi.string().pattern(new RegExp('^[0-9]{4}$')).required()
});