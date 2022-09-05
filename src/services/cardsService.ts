import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker'; 
import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';

import * as throwError from './../utils/errorUtils.js';

import * as repository from './../repositories/cardRepository.js';

import * as company from './companyService.js';
import * as employee from './employeeService.js';
import * as recharge from './rechargesService.js';
import * as payment from './paymentsService.js';

dotenv.config();

const CRYPTR = new Cryptr(process.env.CRYPTR);
const SALTROUNDS = +process.env.BCRYPT || 10;

export type insertControllerType = {
  employeeId: number;
  cardType: repository.TransactionTypes;
}

export type activateControllerType = {
  cvv: string;
  password: string;
}

export async function insert(data: insertControllerType, apiKey: string ) {

  const cardholderName = await validateInsertAndReturnCardHolderName(data, apiKey);

  const newCard: repository.CardInsertData = {
    employeeId: data.employeeId,
    number: generateCardNumber(),
    cardholderName: cardholderName,
    securityCode: generateCvv(),
    expirationDate: generateExpirationDate(),
    password: null,
    isVirtual: false,
    originalCardId: null,
    isBlocked: false,
    type: data.cardType,
  };
 
  return await repository.insert(newCard);
}

export async function activate(id: string, data: activateControllerType) {
  const cardId = parseInt(id);
  await validateActivateCard(cardId, data.cvv);
  const password = getEncryptedPassword(data.password);
  return await repository.update(cardId, { password });
}

export async function block (id: string, password: string) {
  const cardId = parseInt(id);
  const card = await validateIdAndPassword(cardId, password);
  verifyExpirationDateAndThrowError(card.expirationDate);
  isCardBlockedAndFail(card.isBlocked);
  return await repository.update(cardId, { isBlocked: true });
}

export async function unblock (id: string, password: string) {
  const cardId = parseInt(id);
  const card = await validateIdAndPassword(cardId, password);
  verifyExpirationDateAndThrowError(card.expirationDate);
  isCardUnblockedAndFail(card.isBlocked);
  return await repository.update(cardId, { isBlocked: false });
}

export async function getTransactionsAndRechages(id: string) {
  const cardId = parseInt(id); 
  const result = getBalance(cardId);
  return result;
}

async function validateInsertAndReturnCardHolderName(data: insertControllerType, apiKey: string) {
  const employee = await validateCompanyEmployeeAndReturnEmployee(apiKey, data.employeeId);
  await validateEmployeeCards(data);

  return generateCardHolderName(employee.fullName);
}

async function validateCompanyEmployeeAndReturnEmployee(apiKey: string, employeeId: number) {
  const companyId = await getCompany(apiKey);
  const employee = await getEmployee(employeeId);
  if (employee.companyId !== companyId) {
    throw throwError.notFoundError('Invalid company/employee');
  }
  return employee;
}

async function validateEmployeeCards(data: insertControllerType) {
  const card = await repository.findByTypeAndEmployeeId(data.cardType, data.employeeId); 
  if (card) {
    const { today, convertedExpirationDate } = getDates(card.expirationDate);
    if (today <= convertedExpirationDate) {
      throw throwError.conflictError('Card type already registered for employee');
    }
  }
}

async function validateActivateCard (cardId: number, cvv: string) {
  const card = await getCardById(cardId);
  verifyExpirationDateAndThrowError(card.expirationDate);
  verifyCardIsNotActive(card.password);
  validateCvv(cvv, card.securityCode);
}

async function validateIdAndPassword(cardId: number, password: string) {
  const card = await repository.findById(cardId);
  if (!card || card.password === null) {
    throw throwError.unauthorizedError('Invalid id and/or password');
  }
  validatePassword (password, card.password);
  return card;
}

async function getCompany(apiKey: string) {
  return (await company.findByApiKey(apiKey)).id;
}

async function getEmployee(employeeId: number) {
  return await employee.findById(employeeId);
}

export async function getCardById(cardId: number) {
  const card = await repository.findById(cardId);
  if (!card) {
    throw throwError.notFoundError('Card not found');
  }
  return card;
}

function generateCardHolderName(employeeName: string) {
  
  const fullName = employeeName.toUpperCase().split(' ');
  
  if (fullName.length <= 2 ) {
    return fullName.join(' ');
  }

  const cardHolderName = [];

  cardHolderName.push(fullName[0]);

  for (let i = 1; i < fullName.length; i++) {
    if ( i === fullName.length - 1) {
      cardHolderName.push(fullName[i]);
    } else if (fullName[i].length >= 3) {
      cardHolderName.push(fullName[i][0]);
    }
  }

  return cardHolderName.join(' ');
}

function generateExpirationDate() {
  const today = dayjs();
  const expirationDate = today.add(5, 'year');
  return expirationDate.format('MM/YY');
}
  
function generateCardNumber(){
  return faker.finance.creditCardNumber();
}

function generateCvv(){
  const cvv = faker.finance.creditCardCVV();
  console.log('cvv ANTES de criptografar: ',cvv)
  return encryptCvv(cvv);
}

function encryptCvv(cvv: string){
  return CRYPTR.encrypt(cvv);
}

function decryptCvv(cvv: string) {
  return CRYPTR.decrypt(cvv);
}

export function verifyExpirationDateAndThrowError(expirationDate: string) {
  const { today, convertedExpirationDate } = getDates(expirationDate);
  if (today > convertedExpirationDate) {
    throw throwError.unauthorizedError('Card is expired');
  }
}

function getDates(expirationDate: string) {
  const today = dayjs().format('YY/MM');
  const convertedExpirationDate = expirationDate.split('/').reverse().join('/');
  return { today, convertedExpirationDate };
}

function verifyCardIsNotActive(password: string) {
  if (password !== null) {
    throw throwError.unauthorizedError('Card is already activated');
  }
}

export function verifyCardIstActive(password: string) {
  if (password === null) {
    throw throwError.unauthorizedError('Card is not activated');
  }
}

function validateCvv(cvv: string, encryptedCvv: string) {
  if (cvv !== decryptCvv(encryptedCvv)) {   
    throw throwError.unauthorizedError('Invalid CVV');
  }
}

function getEncryptedPassword(password: string) {
  return bcrypt.hashSync(password, SALTROUNDS);
}

export function validatePassword(hashedPassword: string, password: string) {
  const match = bcrypt.compareSync(hashedPassword, password);
  if (!match) {
    throw throwError.unauthorizedError('Invalid id and/or password');    
  }
}

function isCardBlockedAndFail(isBlocked: boolean) {
  if (isBlocked) {
    throw throwError.conflictError('Card already blocked');
  }
}

function isCardUnblockedAndFail(isBlocked: boolean) {
  if (!isBlocked) {
    throw throwError.conflictError('Card already unblocked');
  }
}

export async function validateEmployeeAndCompany(employeeId: number, companyId: number) {
  const employeeData = await employee.findById(employeeId);
  if (companyId !== employeeData.companyId) {
    throw throwError.notFoundError('Card not found');
  }
}

export function verifyCardIsBlocked(isBlocked: boolean) {
  if (isBlocked) {
    throw throwError.conflictError('Card is blocked');
  }
}

export async function getBalance(cardId: number) {
  const recharges = await recharge.getRechargesByCardId(cardId);
  const rechargesAmount = recharge.getTotalRechargeAmount(recharges);

  const transactions = await payment.getPaymentsByCardId(cardId);
  const transactionsAmount = payment.getTotalPaymentAmount(transactions);

  const result = {
    balance: rechargesAmount - transactionsAmount,
    recharges,
    transactions
  }

  return result;
}