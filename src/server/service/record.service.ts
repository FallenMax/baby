import { Records, User } from '../../common/types'
import { generateUuid } from '../../common/util/gen_id'
import { createDatabase, FindOption } from '../lib/database'
import { audit } from './audit.service'

type Record = Records.Record

const RecordDb = createDatabase<Record>('record')
RecordDb.setIndex('id')

const createRecord = async (
  draft: Records.RecordDraft,
  user: User,
): Promise<Record> => {
  // TODO check
  // if (!author || !content || !visibility) {
  //   throw new Error('Invalid record')
  // }
  const id = generateUuid()
  const record: Record = {
    ...draft,
    id,
    babyId: user.id,
    createAt: new Date(),
    updateAt: new Date(),
  }
  await RecordDb.add(record as Record)
  return record as Record
}

const getRecordById = async (id: string): Promise<Record | undefined> => {
  return await RecordDb.findOne({ id })
}

const getRecords = async (
  query: Partial<Record>,
  option: FindOption<Record> = {
    sort: {
      time: -1,
    },
  },
): Promise<Record[]> => {
  return await RecordDb.find(query, option)
}

const updateRecord = async (
  record: Partial<Record> & { id: string },
): Promise<Record> => {
  const { id } = record
  const updateAt = new Date()
  await RecordDb.update({ id }, { ...record, updateAt })
  const re = await RecordDb.findOne({ id })
  return re!
}

const deleteRecordById = async (id: string): Promise<number> => {
  if (await RecordDb.findOne({ id })) {
    await RecordDb.remove({ id })
    return 1
  }
  return 0
}

export const recordService = audit(
  {
    createRecord,
    updateRecord,
    getRecordById,
    getRecords,
    deleteRecordById,
    isContentValid: Records.isValid,
  },
  'record',
  {
    exclude: ['getRecordById', 'getRecords', 'isContentValid'],
  },
)
