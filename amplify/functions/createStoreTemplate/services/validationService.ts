import { ValidationResult } from '../types/index'

export const validateInputs = (event: any): ValidationResult => {
  if (!event.arguments) {
    throw new Error('Invalid event format: missing arguments')
  }

  const { storeId, domain } = event.arguments
  const userId = event.identity?.sub || event.identity?.claims?.sub

  if (!userId) {
    throw new Error('User not authenticated')
  }

  if (!storeId || typeof storeId !== 'string') {
    throw new Error('Invalid or missing storeId')
  }

  if (!domain || typeof domain !== 'string') {
    throw new Error('Invalid or missing domain')
  }

  return {
    storeId,
    domain,
    userId,
  }
}
