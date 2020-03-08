import * as Multer from '@koa/multer'
import * as Router from '@koa/router'
import { Middleware } from 'koa'
import { mapObject } from '../../common/util/object/map_object'
import { ExtendedContext } from '../types/context'
import { isDev } from './env'

type AnyFunction = (...args: any) => any

type FunctionMap = {
  [K: string]: FunctionMap | AnyFunction
}

export type AddParameter<T, P> = T extends AnyFunction
  ? (params: Parameters<T>[0], parameter: P) => ReturnType<T>
  : {
      [K in keyof T]: AddParameter<T[K], P>
    }

// recursively map File to Multier.File
type ToMulterFile<T = any> = T extends File
  ? Multer.File
  : {
      [K in keyof T]: ToMulterFile<T[K]>
    }

// map params
export type ParameterToMulterFile<T> = {
  [K in keyof T]: T[K] extends AnyFunction
    ? (...parameters: ToMulterFile<Parameters<T[K]>>) => ReturnType<T[K]>
    : ParameterToMulterFile<T[K]>
}

const getParamsFromContext = (ctx: ExtendedContext) => {
  const files = ctx.request.files
  if (files && files.length) {
    const params = mapObject(ctx.request.body, (value, key) => {
      if (typeof value === 'string') {
        return JSON.parse(value)
      } else {
        return value
      }
    })
    files.forEach((file) => {
      params[file.fieldname] = file
    })
    return params || {}
  } else {
    const { query = {}, body = {} } = ctx.request
    return {
      ...query,
      ...body,
    }
  }
}

const asApi = (fn: Function): Middleware<{}, ExtendedContext> => async (
  ctx,
) => {
  const params = getParamsFromContext(ctx)

  try {
    if (isDev) {
      console.info('[api] params: ', params)
    }
    const result = await fn(params, ctx)
    if (result && result.errmsg) {
      throw result
    }
    ctx.body = JSON.stringify(result === undefined ? null : result)
    ctx.status = 200
  } catch (error) {
    console.error(error)
    if (error && error.errmsg) {
      ctx.body = {
        errmsg: error.errmsg,
        errcode: error.errcode,
      }
      ctx.status = 400
    } else {
      if (isDev) {
        ctx.body = JSON.stringify(error, null, 2)
      }
      ctx.status = 500
    }
  }
}

export const registerApi = <T extends FunctionMap, Context = any>(
  router: Router,
  api: AddParameter<T, Context>,
  base = '/api',
) => {
  Object.keys(api).forEach((path) => {
    const mapOrFunction = api[path] as unknown
    if (typeof mapOrFunction === 'function') {
      const fullPath = base + `/${path}`
      console.info('[api] register:', fullPath)
      router.get(fullPath, asApi(mapOrFunction))
      router.post(fullPath, asApi(mapOrFunction))
    } else if (typeof mapOrFunction === 'object') {
      registerApi(
        router,
        mapOrFunction as AddParameter<T, Context>,
        base + '/' + path,
      )
    }
  })
}
