import { Company } from './../repositories/companyRepository';
import * as throwError from './../utils/errorUtils.js';
import * as repository from './../repositories/rechargeRepository.js';
import * as company from './companyService.js';
import * as cards from './cardsService.js';


export async function insert(apiKey: string, id: string, amount: number) {
  const cardId = parseInt(id);
  await validateInsert(apiKey, cardId, amount);
  const newRecharge: repository.RechargeInsertData = {
    cardId , 
    amount
  };
  return await repository.insert(newRecharge);
}

async function validateInsert(apiKey: string, cardId: number, amount: number) {
  const company = await findCompanyByApiKey(apiKey);
  const card = await findCardById(cardId);
  cards.verifyExpirationDateAndThrowError(card.expirationDate);
  cards.verifyCardIstActive(card.password);
  await findEmployeeByIdAndCompany(card.employeeId, company.id) 
}

async function findCompanyByApiKey(apiKey: string) {
  return await company.findByApiKey(apiKey);
}

async function findCardById(cardId: number) {
  return await cards.getCardById(cardId);
}

async function findEmployeeByIdAndCompany(employeeId: number, companyId: number) {
  await cards.validateEmployeeAndCompany(employeeId, companyId);
}