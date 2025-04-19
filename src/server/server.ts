require('./polyfill')
import * as cors from '@koa/cors'
import * as http from 'http'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as compress from 'koa-compress'
import * as logger from 'koa-logger'
import * as session from 'koa-session'
import { config } from './config'
import { error } from './middleware/error.middleware'
import { routes } from './router'
import { sessionService } from './service/session.service'
import { isDev, isTesting } from './utils/env'

let server: http.Server | undefined

const panic = (e: any) => {
  console.error('[PANIC]', e)
  process.exit(-1)
}

export const start = () => {
  return new Promise<void>((resolve) => {
    console.info('--- start ---')

    const app = new Koa()

    app.keys = config.keys
    app.use(error())
    app.use(logger())
    app.use(compress())
    app.use(
      session(
        {
          key: 'baby:sess',
          maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
          renew: true,
          sameSite: true,
          store: {
            get: sessionService.get,
            set: sessionService.set,
            destroy: sessionService.destroy,
          },
        },
        app as any,
      ),
    )
    app.use(bodyParser()) // parse: json form text to ctx.request.body
    app.use(
      cors({
        origin: (ctx) => {
          if (isDev) {
            return ctx.request.headers.origin
          } else {
            const whitelist = ['https://baby.1976f.com']
            return whitelist.join(', ')
          }
        },
        credentials: isDev,
      }),
    )
    app.use(routes)

    app.on('error', panic)
    process.on('uncaughtException', panic)
    process.on('unhandledRejection', panic)

    const port = config.port
    server = app.listen(port, resolve)
    console.info('Listening on', port)
  })
}

export const quit = () => {
  console.info('--- quit ---')
  if (server) {
    server.close()
    server = undefined
  }
}

if (!isTesting) {
  ;(async () => {
    try {
      await start()
    } catch (error) {
      panic(error)
    }
  })()
}
