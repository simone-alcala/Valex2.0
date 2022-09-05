import { Request, Response } from 'express';

import * as service from './../services/paymentsService.js';

export async function insert(req: Request, res: Response) {
  const { id } = req.params;
  const { businessId, amount, password } : service.insertControllerPayment = req.body;
  await service.insert(id, { businessId, amount, password });
  res.sendStatus(201);
}