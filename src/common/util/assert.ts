import { isDebugging } from './env'
import { ErrorCode } from '../types'
import { UserError } from './error'

export const assert = (condition: any, message: string | ErrorCode): void => {
  if (!condition) {
    throw typeof message === 'number'
      ? new UserError(message)
      : new Error(message)
  }
}

export const assertNever = (o: never): never => {
  throw new TypeError('Unexpected type: ' + JSON.stringify(o))
}

export const softAssertNever = (o: never): undefined => {
  if (isDebugging) {
    console.warn('Unexpected type:', o)
  }
  return undefined
}
