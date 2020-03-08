import { Context } from 'koa'
import * as Multer from '@koa/multer'
import { SessionItem } from '../service/session.service'

export type ExtendedContext = Context & {
  // by koa-session
  session: SessionItem['content']
  request: {
    // by koa-bodyparser & koa-multer
    body: any
    // by koa-multer
    files?: Multer.File[]
  }
}
