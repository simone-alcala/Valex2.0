import * as throwError from './../utils/errorUtils.js';
import * as cards from './cardsService.js';
import * as businesses from './businessService.js';
import { TransactionTypes } from './../repositories/cardRepository.js';
import * as repository from './../repositories/paymentRepository.js';

export type insertControllerPayment ={
  businessId: number;
  amount: number;
  password: string
}

export async function insert(id: string, data: insertControllerPayment) {
  const { businessId, amount, password } = data;
  const cardId = parseInt(id);
  const card = await validateCard(cardId, password);
  await validateBusiness(businessId, card.type);
  await validateAmount(cardId, amount);

  const newPayment: repository.PaymentInsertData = {
    cardId,
    businessId,
    amount
  };
 
  return await repository.insert(newPayment);
}

async function validateCard(cardId: number, password: string) {
  const card = await cards.getCardById(cardId);
  cards.verifyExpirationDateAndThrowError(card.expirationDate);
  cards.verifyCardIstActive(card.password);
  cards.verifyCardIsBlocked(card.isBlocked);
  cards.validatePassword(password, card.password);
  return card;
}

async function validateBusiness(businessId: number, type: TransactionTypes) {
  const business = await businesses.findById(businessId);
  businesses.validateBusinessType(business, type);
}

async function validateAmount(cardId: number, amount: number) {
  const { balance } = await cards.getBalance(cardId);
  if ( balance - amount < 0) {
    throw throwError.conflictError('Insufficient funds');
  }
}

export async function getPaymentsByCardId(cardId: number) {
  return await repository.findByCardId(cardId);
}

export function getTotalPaymentAmount(recharges: repository.Payment[]) {
  let sum = recharges.reduce((prev, cur) => prev + cur.amount, 0);
  return sum;
}