import * as Datastore from 'nedb'
import * as path from 'path'
import { filterObject } from '../../common/util/object/filter_object'
import { config } from '../config'
import { promisifyAll } from '../utils/promisify'

type Id = { id: string }

type Nullable<T> = {
  [P in keyof T]?: T[P] | null | undefined
}

export type FindOption<T> = {
  sort?: { [K in keyof T]?: -1 | 1 }
  limit?: number
  skip?: number
}
export interface Database<T extends Id> {
  add: (item: T) => Promise<Id>
  find: (query: Partial<T>, option?: FindOption<T>) => Promise<T[]>
  findOne: (query: Partial<T>) => Promise<T | undefined>
  findAll: (option?: FindOption<T>) => Promise<T[]>
  remove: (query: Partial<T>) => Promise<void>
  removeMulti: (query: Partial<T>) => Promise<void>
  update: (query: Partial<T> & Id, item: Nullable<T>) => Promise<T>
  upsert: (query: Partial<T> & Id, item: T) => Promise<void>
  setIndex(field: keyof T): void
  destroy: () => void
}

const databases: {
  [key: string]: Nedb & { [K: string]: (...args: any[]) => Promise<any> }
} = {}

export function createDatabase<T extends { id: string }>(
  name: string,
): Database<T> {
  if (!databases[name]) {
    const db = new Datastore({
      filename: path.resolve(config.dataDir, name),
      timestampData: true,
      autoload: true,
    })
    db.ensureIndex({
      fieldName: 'id',
      unique: true,
    })
    databases[name] = promisifyAll(db)
  }
  const db = databases[name]

  db.persistence.setAutocompactionInterval(1000 * 60 * 60)

  const database: Database<T> = {
    add: (item) => db.insertAsync(item),
    find: (query, option) => {
      let { limit, skip, sort } = option || {}
      let cursor = db.find(query)
      if (sort) {
        cursor = cursor.sort(sort)
      }
      if (skip) {
        cursor = cursor.skip(skip)
      }
      if (limit) {
        cursor = cursor.limit(limit)
      }
      return new Promise((resolve, reject) => {
        cursor.exec((err, doc) => {
          if (err) {
            reject(err)
          } else {
            resolve(doc)
          }
        })
      })
    },
    findOne: (query) => db.findOneAsync(query),
    findAll: (option) => database.find({}, option),
    remove: (query) => db.removeAsync(query),
    removeMulti: (query) => db.removeAsync(query, { multi: true }),
    update: async (query, item) => {
      const orig = await db.findOneAsync(query)
      if (!orig) {
        console.error('failed to update: item not found', { query, item })
        throw new Error('failed to update: item not found')
      }
      const patched = {
        ...orig,
        ...filterObject(item as any, (value) => value !== undefined),
      }
      await db.updateAsync(query, patched)
      const updated = await database.findOne(query)
      return updated!
    },
    upsert: (query, item) => db.updateAsync(query, item, { upsert: true }),
    setIndex(field) {
      db.ensureIndex({
        fieldName: field as string,
        // unique: true,
      })
    },
    destroy: () => {
      db.persistence.stopAutocompaction()
    },
  }
  return database
  // return logObject(database, 'db')
}
