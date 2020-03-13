import { ErrorCode, ErrorMessage } from '../types'

export const isUserError = (e: any): e is UserError => {
  return 'errmsg' in e
}

export class UserError extends Error {
  errmsg: string
  errcode: ErrorCode | undefined
  data: any

  constructor(msgOrCode: string | ErrorCode, code?: ErrorCode, data?: any) {
    const errmsg =
      typeof msgOrCode === 'string' ? msgOrCode : ErrorMessage[msgOrCode]
    const errcode = typeof msgOrCode === 'string' ? code : msgOrCode
    super(errmsg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserError)
    } else {
      this.stack = new Error(errmsg).stack
    }

    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, UserError.prototype)
    } else {
      // @ts-ignore
      this.__proto__ = new.target.prototype
    }

    this.errmsg = errmsg
    this.errcode = errcode
    this.data = data
  }
}
