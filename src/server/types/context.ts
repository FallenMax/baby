import { Context } from 'koa'
import { SessionItem } from '../service/session.service'

export type ExtendedContext = Context & {
  // by koa-session
  session: SessionItem['content']
  request: {
    // by koa-bodyparser
    body: any
  }
}
