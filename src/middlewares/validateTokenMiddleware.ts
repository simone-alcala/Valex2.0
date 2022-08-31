import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

import * as throwError from './../utils/errorUtils.js';

dotenv.config();

export default async function validateToken(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    throw throwError.badRequestError('ApiKey is required');
  }
  next();
}
