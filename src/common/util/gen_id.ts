import * as crypto from 'crypto'
import * as uuidv4 from 'uuid/v4'

export const generateUuid = (): string => {
  return uuidv4()
}

export const generateId = (length: number = 8): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
