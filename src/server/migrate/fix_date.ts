import { Records } from '../../common/types'
import { migrateDatabase, openDatabase } from '../lib/database'

export const fixRecord = async (dryrun: boolean) => {
  const db = openDatabase<Records.Record>('record')

  const fix = (record: Records.Record): Records.Record | undefined => {
    let needFix = false
    if (record.time && typeof record.time === 'string') {
      needFix = true
      record.time = new Date(record.time)
    }
    if (record.createAt && typeof record.createAt === 'string') {
      needFix = true
      record.createAt = new Date(record.createAt)
    }
    if (record.updateAt && typeof record.updateAt === 'string') {
      needFix = true
      record.updateAt = new Date(record.updateAt)
    }
    if ('amount' in record && typeof record.amount === 'string') {
      record.amount = Number(record.amount)
    }
    return needFix ? record : undefined
  }

  await migrateDatabase(db, fix, { dryrun })
}
