import m from 'mithril'
import { ApiAsync, ErrorCode } from '../common/types'
import { UserError } from '../common/util/error'
import { decode, encode } from '../common/util/serialize'
import { config } from './config'

const createApiClient = (basePath: string) => {
  const noop = () => {}
  noop.basePath = basePath
  return new Proxy(noop, {
    get(proxy, namespace) {
      if (typeof namespace !== 'string' && typeof namespace !== 'number') {
        throw new TypeError('expects string or number')
      }
      return createApiClient(`${proxy.basePath}/${namespace}`)
    },
    apply(proxy, thisArg, [params]): any {
      return m
        .request(proxy.basePath, {
          method: 'POST',
          body: encode(params),
          withCredentials: true,
        })
        .then((result) => {
          return decode(result)
        })
        .catch((e) => {
          if (e && e.response) {
            throw e.response
          }
          if (e && e.code === 0 && e.response === null) {
            throw new UserError(ErrorCode.NO_NETWORK)
          }
          throw e
        })
    },
  })
}

export const api: ApiAsync = createApiClient(
  `${location.protocol}//${config.host}/api`,
)
