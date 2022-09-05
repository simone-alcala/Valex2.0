import * as throwError from './../utils/errorUtils.js';
import { TransactionTypes } from '../repositories/cardRepository.js';
import * as repository from './../repositories/businessRepository.js';

export async function findById(businessId: number) {
  const result = await repository.findById(businessId);
  if (!result) {
    throw throwError.conflictError('Business id not found');
  }
  return result;
}

export function validateBusinessType(business: repository.Business, type: TransactionTypes) {
  if (business.type !== type) {
    throw throwError.conflictError('Card type is not allowed in this shop');
  }
}