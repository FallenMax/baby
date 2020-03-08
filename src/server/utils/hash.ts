import * as crypto from 'crypto'

export const createHash = (str: string, length = 6) => {
  const hash = crypto.createHash('sha256')
  hash.update(str)
  return hash.digest('hex').slice(0, length)
}
