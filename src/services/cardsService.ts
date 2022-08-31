import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker'; 
import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';

import * as throwError from './../utils/errorUtils.js';

import * as repository from './../repositories/cardRepository.js';

import * as company from './companyService.js';
import * as employee from './employeeService.js';

dotenv.config();

const CRYPTR = new Cryptr(process.env.CRYPTR);
const SALTROUNDS = +process.env.BCRYPT || 10;

export type insertControllerType = {
  employeeId: number;
  cardType: repository.TransactionTypes;
}

export type activateControllerType = {
  cardId: string;
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

export async function activate(data: activateControllerType) {
  const cardId = parseInt(data.cardId);
  await validateActivateCard(cardId, data.cvv, data.password);
  const password = getEncryptedPassword(data.password);
  return await repository.update(cardId, { password });
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
    throw throwError.conflictError('Card type already registered for employee');
  }
}

async function validateActivateCard (cardId: number, cvv: string, password: string) {
  const card = await getCardById(cardId);
  verifyExpirationDate(card.expirationDate);
  verifyCardIsNotActive(card.password);
  validateCvv(card.securityCode);
}

async function getCompany(apiKey: string) {
  return (await company.findByApiKey(apiKey)).id;
}

async function getEmployee(employeeId: number) {
  return await employee.findById(employeeId);
}

async function getCardById(cardId: number) {
  const card = await repository.findById(cardId);
  if (!cardId) {
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

function decryptCvv(cvv: string){
  return CRYPTR.decrypt(cvv);
}

function verifyExpirationDate(expirationDate: string) {
  const today = dayjs().format('YY/MM');
  const convertedExpirationDate = expirationDate.split('/').reverse().join('/');
  if (today > convertedExpirationDate){
    throw throwError.unauthorizedError('Card is expired');
  }
}

function verifyCardIsNotActive(password: string) {
  if (password !== null) {
    throw throwError.unauthorizedError('Card is already activated');
  }
}

function validateCvv(cvv: string) {
  if (cvv !== decryptCvv(cvv)) {
    throw throwError.unauthorizedError('Invalid CVV');
  }
}

function getEncryptedPassword(password: string) {
  return bcrypt.hashSync(password, SALTROUNDS);
}

async function validatePassword(hashedPassword: string, password: string, ) {
  const match = await bcrypt.compare(password, hashedPassword);
  if (!match) {
    throw throwError.unauthorizedError('Invalid user/password');    
  }
}