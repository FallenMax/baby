import * as cors from '@koa/cors'
import * as multipartParser from '@koa/multer'
import * as http from 'http'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as compress from 'koa-compress'
import * as logger from 'koa-logger'
import * as session from 'koa-session'
import { Records } from '../common/types'
import { DAY, HOUR } from '../common/util/time'
import { config } from './config'
import { error } from './middleware/error.middleware'
import { routes } from './router'
import { fileService } from './service/file.service'
import { recordService } from './service/record.service'
import { sessionService } from './service/session.service'
import { userService } from './service/user.service'
import { isDev, isTesting } from './utils/env'

let server: http.Server | undefined

const panic = (e: any) => {
  console.error('[PANIC]', e)
  process.exit(-1)
}

export const start = () => {
  return new Promise((resolve) => {
    console.info('--- start ---')
    fileService.ensureDirectory(config.uploadDir)
    fileService.ensureDirectory(config.dataDir)

    const app = new Koa()

    app.keys = config.keys
    app.use(error())
    app.use(logger())
    app.use(compress())
    // app.use(
    //   helmet({
    //     contentSecurityPolicy: {
    //       directives: {
    //         defaultSrc: ["'self'"],
    //       },
    //     },
    //   }),
    // )
    app.use(
      session(
        {
          key: 'baby:sess',
          maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
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
    app.use(multipartParser().any()) // parse: multipart/form-data (e.g. file upload) to ctx.request.files
    app.use(
      cors({
        origin: (ctx) => {
          // TODO white list
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

const filldata = async () => {
  try {
    await userService.register({ name: 'TEST', password: '123456' })
  } catch (error) {
    await userService.login({ name: 'TEST', password: '123456' })
  }
  const user = await userService.getByName('TEST')
  if (!user) {
    throw new Error('user not found')
  }
  const records = await recordService.getRecords({ babyId: user.id })
  if (records.length) {
    return
  }
  console.log('records ', records)
  for (const rec of records) {
    await recordService.deleteRecordById(rec.id)
  }

  const days = 365 * 2
  const now = new Date().getTime()
  let start = now - days * DAY
  let isSleeping = false
  let newRecords: Records.RecordDraft[] = []
  while (start < now) {
    const time = new Date(start)

    const dice = Math.random()
    switch (true) {
      case dice < 0.2: {
        newRecords.push({
          type: isSleeping ? 'wakeup' : 'sleep',
          time,
        })
        isSleeping = !isSleeping
        break
      }
      case dice < 0.4: {
        newRecords.push({
          type: 'eat',
          food: 'formula_milk',
          amount: Math.floor(Math.random() * 240),
          time,
        })
        break
      }

      case dice < 0.6: {
        newRecords.push({
          type: 'eat',
          food: 'breast_milk',
          amount: Math.floor(Math.random() * 240),
          time,
        })
        break
      }
      case dice < 0.8: {
        newRecords.push({
          type: 'eat',
          food: 'baby_food',
          time,
        })
        break
      }
      case dice < 0.9: {
        newRecords.push({
          type: 'piss',
          time,
        })
        break
      }
      case dice < 1: {
        newRecords.push({
          type: 'poop',
          time,
        })
        break
      }
    }

    start += Math.floor(Math.random() * HOUR * 6)
  }
  for (let index = 0; index < newRecords.length; index++) {
    const rec = newRecords[index]
    console.log(`adding ${index}/${newRecords.length}`)
    await recordService.createRecord(rec, user)
  }
  console.info('done')
}

if (!isTesting) {
  ;(async () => {
    try {
      await filldata()
      await start()
    } catch (error) {
      panic(error)
    }
  })()
}
