import { Request, Response } from 'express';

import * as service from './../services/cardsService.js';

export async function insert(req: Request, res: Response) {
  const apiKey = req.headers['x-api-key'] as string;
  const { employeeId, cardType } : service.insertControllerType = req.body;
  await service.insert({ employeeId, cardType }, apiKey);
  res.sendStatus(201);
}

export async function activate(req: Request, res: Response) {
  const { id } = req.params;
  const { cvv, password } : service.activateControllerType = req.body;
  await service.activate(id, { cvv, password });
  res.sendStatus(200);
}

export async function getTransactions(req: Request, res: Response) {
  res.sendStatus(200);
}

export async function block(req: Request, res: Response) {
  const { id } = req.params;
  const { password } = req.body ;
  await service.block(id, password);
  res.sendStatus(200);
}

export async function unblock(req: Request, res: Response) {
  const { id } = req.params;
  const { password } = req.body ;
  await service.unblock(id, password);
  res.sendStatus(200);
}