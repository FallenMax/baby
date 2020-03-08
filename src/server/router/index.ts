import { Middleware } from 'koa'
import * as Router from '@koa/router'
import * as send from 'koa-send'
import { config } from '../config'
import { api } from '../controller/api'
import { ExtendedContext } from '../types/context'
import { registerApi } from '../utils/api_map'

const router = new Router()

// APIs
router.all(
  '/api',
  async (ctx: ExtendedContext, next: Middleware<ExtendedContext>) => {
    ctx.body = 'ok'
  },
)
registerApi(router, api)

// user uploaded files
router.all(`/${config.uploadPath}/:file*`, async (ctx: ExtendedContext) => {
  // TODO permissions
  try {
    const filePath = ctx.path
      .split('/')
      .filter(Boolean)
      .slice(1)
      .join('/')
    await send(ctx, filePath, {
      root: config.uploadDir,
    })
  } catch (err) {
    if (err.status !== 404) {
      throw err
    }
  }
})

// static resources
router.get(`/${config.publicPath}/:file*`, async (ctx: ExtendedContext) => {
  try {
    const filePath = ctx.path
      .split('/')
      .filter(Boolean)
      .slice(1)
      .join('/')

    await send(ctx, filePath, {
      root: config.publicDir,
    })
  } catch (err) {
    if (err.status !== 404) {
      throw err
    }
  }
})

// pages
router.get(
  '/*',
  async (ctx: ExtendedContext, next: Middleware<ExtendedContext>) => {
    await send(ctx, 'index.html', {
      root: config.publicDir,
    })
  },
)

export const routes = router.routes()
