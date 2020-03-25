import { ReturnPromise } from './util.types'

//-------------- Domains --------------

export type User = {
  id: string
  name: string
  email?: string
  photo?: string | undefined
  bio?: string | undefined
}

export type UserId = User['id']

export namespace Records {
  export type Food = 'breast_milk' | 'formula_milk' | 'baby_food'

  export type Eat = {
    type: 'eat'
    time: Date
    food: Food
    amount?: number
    note?: string
  }
  export type Sleep = {
    type: 'sleep' | 'wakeup'
    time: Date
    note?: string
  }
  export type Custom = {
    type: 'custom'
    subtype: string
    time: Date
    amount?: number
    note?: string
  }
  export type PissPoop = {
    type: 'piss' | 'poop'
    time: Date
    note?: string
  }
  export type RecordDraft = Eat | Sleep | PissPoop | Custom

  export type Record = RecordDraft & {
    id: string
    babyId: string
    createAt: Date
    updateAt: Date
  }

  export const isValid = (r: any): r is Record => {
    return true
  }
  export const foodHasAmount = (food: Food) => {
    return food === 'breast_milk' || food === 'formula_milk'
  }

  export type CustomTypeDraft = {
    emoji?: string
    color?: string
    name: string
  }
  export type CustomType = CustomTypeDraft & {
    id: string
    userId: string
  }
}

//-------------- Error --------------

export enum ErrorCode {
  UNKNOWN = 10000,
  NO_NETWORK,
  REQUIRE_LOGIN,
  REGISTER_INVALID_USERNAME,
  REGISTER_INVALID_PASSWORD,
  REGISTER_EXISTED_ACCOUNT,
  LOGIN_INCORRECT_NAME_PASS,
  LOGIN_WHILE_LOGGED_IN,
  LOGOUT_WHILE_NOT_LOGGED_IN,
  UPDATE_ITEM_NOT_FOUND,
  DELETE_ITEM_NOT_FOUND,
  ITEM_INVALID,
  USER_NOT_EXIST,
  UNKNOWN_CUSTOM_TYPE,
}

export const ErrorMessage: { [K in ErrorCode]: string } = {
  [ErrorCode.UNKNOWN]:
    'Something went wrong. Please refresh page and try again.',
  [ErrorCode.NO_NETWORK]:
    'Cannot connect to network, will sync again when connected.',
  [ErrorCode.REQUIRE_LOGIN]: 'Please login to complete operation',
  [ErrorCode.REGISTER_INVALID_USERNAME]: 'Invalid username',
  [ErrorCode.REGISTER_INVALID_PASSWORD]: 'Invalid password',
  [ErrorCode.REGISTER_EXISTED_ACCOUNT]: 'Account already exists',
  [ErrorCode.LOGIN_INCORRECT_NAME_PASS]: 'Incorrect name/password',
  [ErrorCode.LOGIN_WHILE_LOGGED_IN]: `You're already logged in`,
  [ErrorCode.LOGOUT_WHILE_NOT_LOGGED_IN]: `You're already logged out`,
  [ErrorCode.UPDATE_ITEM_NOT_FOUND]:
    'Record not found, please check and refresh',
  [ErrorCode.DELETE_ITEM_NOT_FOUND]:
    'Record not found, please check and refresh',
  [ErrorCode.ITEM_INVALID]: 'Invalid record, please check again',
  [ErrorCode.USER_NOT_EXIST]: 'User not exist, please check and try again',
  [ErrorCode.UNKNOWN_CUSTOM_TYPE]:
    'Event type not exist, please refresh and try again',
}

export const getMessage = (e: ErrorCode) => {
  return ErrorMessage[e]
}

//-------------- API --------------

export type ApiSync = {
  user: {
    getMe(): User | undefined
    logout(): void
    registerOrLogin(params: {
      name: string
      password: string
    }): { user: User; type: 'new' | 'existed' }
    changePassword(params: { password: string; newPassword: string }): void
  }
  record: {
    getMyRecords(params: {}): Records.Record[]
    getMyRecordById(params: { id: string }): Records.Record | undefined
    createRecord(record: Records.RecordDraft): Records.Record
    updateRecord(record: Records.RecordDraft & { id: string }): Records.Record
    deleteRecord(params: { id: string }): number

    getMyCustomTypes(params: {}): Records.CustomType[]
    createCustomType(type: Records.CustomTypeDraft): Records.CustomType
    updateCustomType(
      type: Records.CustomTypeDraft & { id: string },
    ): Records.CustomType
    deleteCustomType(params: { id: string }): number
  }
}

export type Api = ReturnPromise<ApiSync>
