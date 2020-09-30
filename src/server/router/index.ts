import * as Router from '@koa/router'
import * as send from 'koa-send'
import { config } from '../config'
import { api } from '../controller/api'
import { createApiGateway } from '../lib/api_gateway'
import { ExtendedContext } from '../types/context'

const router = new Router()

// api
router.use(`/${config.apiPath}`, createApiGateway(api))

// static resources
router.get(`/${config.publicPath}/:file*`, async (ctx: ExtendedContext) => {
  try {
    const filePath = ctx.path.split('/').filter(Boolean).slice(1).join('/')

    await send(ctx, filePath, {
      root: config.publicDir,
      immutable: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // static resources are content-hashed and will not change
    })
  } catch (err) {
    if (err.status !== 404) {
      throw err
    }
  }
})

// pages
router.get(
  '/(.*)',
  async (ctx: ExtendedContext, next: Router.Middleware<ExtendedContext>) => {
    await send(ctx, 'index.html', {
      root: config.publicDir,
      maxAge: 0,
    })
  },
)

export const routes = router.routes()
