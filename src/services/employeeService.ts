import * as throwError from './../utils/errorUtils.js';
import * as repository from './../repositories/employeeRepository.js';

export async function findById(employeeId: number) {
  const employee = await repository.findById(employeeId)
  if (!employee) {
    throw throwError.notFoundError('Employee not found');
  }
  return employee;
}

  
