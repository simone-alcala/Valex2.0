import * as throwError from './../utils/errorUtils.js';
import * as repository from './../repositories/companyRepository.js';

export async function findByApiKey(apiKey: string) {
  const company = await repository.findByApiKey(apiKey);
  if (!company) {
    throw throwError.notFoundError('Company not found');
  }
  return company;
}

  
