import * as crypto from 'crypto'
import { ErrorCode, User } from '../../common/types'
import { UserError } from '../../common/util/error'
import { generateId } from '../../common/util/gen_id'
import { createDatabase } from '../lib/database'
import { ExtendedContext } from '../types/context'
import { audit } from './audit.service'

//-------------- types --------------

type Sensitive = {
  hash: string
  salt: string
  registeredAt: Date
}
export type Account = User & Sensitive

//-------------- db --------------

const db = createDatabase<Account>('account')
db.setIndex('name')

//-------------- utils --------------

const accountToUser = (acc: Account): User => {
  const { id, name, photo, bio } = acc
  return { id, name, photo, bio }
}

const createHash = (password: string, salt: string) => {
  const hash = crypto.createHmac('sha512', salt) /** Hashing algorithm sha512 */
  hash.update(password)
  return hash.digest('hex')
}

const createSaltHash = (password: string) => {
  const salt = generateId(16)
  const hash = createHash(password, salt)
  return { salt, hash }
}

const isValidName = (str: string) => str.trim() !== ''

const isValidPassword = (pass: string) =>
  typeof pass === 'string' && pass.length >= 6

//-------------- service --------------

const register = async ({
  name,
  password,
}: {
  name: string
  password: string
}): Promise<User> => {
  if (!name) {
    throw new UserError(ErrorCode.REGISTER_INVALID_USERNAME)
  }
  if (!isValidPassword(password)) {
    throw new UserError(ErrorCode.REGISTER_INVALID_PASSWORD)
  }
  const existedAccount = await db.findOne({ name })
  if (existedAccount) {
    throw new UserError(ErrorCode.REGISTER_EXISTED_ACCOUNT)
  }
  const { salt, hash } = createSaltHash(password)
  const id = generateId()
  const account: Account = {
    id,
    name,
    photo: undefined,
    salt,
    hash,
    registeredAt: new Date(),
  }
  await db.upsert({ id }, account)
  return accountToUser(account)
}

const login = async ({
  name,
  password,
}: {
  name: string
  password: string
}): Promise<User> => {
  if (!isValidName(name)) {
    throw new UserError(ErrorCode.REGISTER_INVALID_USERNAME)
  }
  if (!isValidPassword(password)) {
    throw new UserError(ErrorCode.REGISTER_INVALID_PASSWORD)
  }
  const existed = await db.findOne({ name })
  if (!existed) throw new UserError(ErrorCode.LOGIN_INCORRECT_NAME_PASS)

  const { id, salt, hash } = existed
  const calculatedHash = createHash(password, salt)
  if (calculatedHash !== hash) {
    throw new UserError(ErrorCode.LOGIN_INCORRECT_NAME_PASS)
  }
  return accountToUser(existed)
}

const changePassword = async ({
  name,
  password,
  newPassword,
}: {
  name: string
  password: string
  newPassword: string
}): Promise<void> => {
  if (!isValidName(name)) {
    throw new UserError(ErrorCode.REGISTER_INVALID_USERNAME)
  }
  if (!isValidPassword(password)) {
    throw new UserError(ErrorCode.REGISTER_INVALID_PASSWORD)
  }
  const existed = await db.findOne({ name })
  if (!existed) throw new UserError(ErrorCode.LOGIN_INCORRECT_NAME_PASS)

  const { id, salt, hash } = existed
  const calculatedHash = createHash(password, salt)
  if (calculatedHash !== hash) {
    throw new UserError(ErrorCode.LOGIN_INCORRECT_NAME_PASS)
  }

  if (!isValidPassword(newPassword)) {
    throw new UserError(ErrorCode.REGISTER_INVALID_PASSWORD)
  }
  {
    const { salt, hash } = createSaltHash(newPassword)
    await db.update({ id }, { salt, hash })
  }
}

const getById = async (id: string): Promise<User | undefined> => {
  const account = await db.findOne({ id })
  if (!account) return undefined
  return accountToUser(account)
}

const getByName = async (name: string): Promise<User | undefined> => {
  const account = await db.findOne({ name })
  if (!account) return undefined
  return accountToUser(account)
}

const getUserOrThrow = async (ctx: ExtendedContext): Promise<User> => {
  const user =
    ctx.session.userId && (await userService.getById(ctx.session.userId))
  if (!user) {
    throw new UserError(ErrorCode.REQUIRE_LOGIN)
  }
  return user
}

export const userService = audit(
  {
    login,
    register,
    changePassword,
    getById,
    getByName,
    getUserOrThrow,
  },
  'account',
)
