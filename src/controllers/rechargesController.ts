import { Request, Response } from 'express';

import * as service from './../services/rechargesService.js';

export async function insert(req: Request, res: Response) {
  const apiKey = req.headers['x-api-key'] as string;
  const { id } = req.params;
  const { amount } = req.body;
  await service.insert(apiKey, id, amount);
  res.sendStatus(201);
}