import { openDatabase } from '../lib/database'

export interface SessionItem {
  id: string
  content: Partial<{
    view: number
    userId: string
  }>
}

const db = openDatabase<SessionItem>('session')

const get = async (id: string): Promise<SessionItem['content'] | undefined> => {
  const item = await db.findOne({ id })
  return item && item.content
}
const set = async (id: string, content: SessionItem['content']) => {
  return await db.upsert({ id }, { id, content })
}
const destroy = async (id: string) => {
  return await db.remove({ id })
}

const service = {
  get,
  set,
  destroy,
}

export const sessionService = service
