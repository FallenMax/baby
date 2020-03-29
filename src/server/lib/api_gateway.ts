import * as Router from '@koa/router'
import { Middleware } from 'koa'
import { AddParameter } from '../../common/util.types'
import { decode, encode } from '../../common/util/serialize'
import { ApiWithContext } from '../types/api'
import { ExtendedContext } from '../types/context'
import { isDev } from '../utils/env'

type AnyFunction = (...args: any) => any

type FunctionMap = {
  [K: string]: FunctionMap | AnyFunction
}

const asHandler = (fn: Function): Middleware<{}, ExtendedContext> => async (
  ctx,
) => {
  const { query = {}, body = {} } = ctx.request
  let params = decode({
    ...query,
    ...body,
  })

  try {
    if (isDev) {
      console.info('[api] params: ', params)
    }
    const result = await fn(params, ctx)
    if (result && result.errmsg) {
      throw result
    }
    ctx.body = JSON.stringify(encode(result === undefined ? null : result))
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

const registerApi = <T extends FunctionMap, Context = any>(
  router: Router,
  api: AddParameter<T, Context>,
  base = '',
) => {
  Object.keys(api).forEach((path) => {
    const mapOrFunction = api[path] as unknown
    if (typeof mapOrFunction === 'function') {
      const fullPath = base + `/${path}`
      console.info('[api] register:', fullPath)
      router.post(fullPath, asHandler(mapOrFunction))
    } else if (typeof mapOrFunction === 'object') {
      registerApi(
        router,
        mapOrFunction as AddParameter<T, Context>,
        base + '/' + path,
      )
    }
  })
}

export const createApiGateway = (api: ApiWithContext) => {
  const router = new Router()
  registerApi(router, api)

  return router.routes()
}
