import m from 'mithril'
import { Api, ErrorCode } from '../common/types'
import { UserError } from '../common/util/error'
import { config } from './config'

const toFormData = (o: any): FormData => {
  const formData = new FormData()
  Object.entries(o).forEach(([key, value]) => {
    formData.append(
      key,
      value instanceof File
        ? value
        : JSON.stringify(value === undefined ? null : value),
    )
  })
  return formData
}

const handler: ProxyHandler<any> = {
  get(target, property, receiver) {
    if (typeof property !== 'string' && typeof property !== 'number') {
      return receiver[property]
    }
    return createProxy(`${target.base}/${property}`)
  },
  apply(target: { base: string }, thisArg, [params]): any {
    const hasFileInParams =
      typeof params === 'object' &&
      params &&
      Object.values(params).some((value) => value instanceof File)

    const payload = hasFileInParams ? toFormData(params) : params

    const request = m.request(target.base, {
      method: 'POST',
      body: payload,
      withCredentials: true,
    })

    return request.catch((e) => {
      if (e && e.response) {
        throw e.response
      }
      if (e && e.code === 0 && e.response === null) {
        throw new UserError(ErrorCode.NO_NETWORK)
      }
      throw e
    })
  },
}

const createProxy = (base: string) => {
  const noop = () => {}
  noop.base = base
  return new Proxy(noop, handler)
}

export const api: Api = createProxy(`${location.protocol}//${config.host}/api`)
