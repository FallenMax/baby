import { ErrorCode, Records, User } from '../../common/types'
import { UserError } from '../../common/util/error'
import { generateUuid } from '../../common/util/gen_id'
import { FindOption, openDatabase } from '../lib/database'
import { audit } from './audit.service'

type Record = Records.Record
type CustomType = Records.CustomType

const RecordDb = openDatabase<Record>('record')
RecordDb.setIndex('id')
RecordDb.setIndex('babyId')

const CustomTypeDb = openDatabase<CustomType>('custom_type')
CustomTypeDb.setIndex('id')
CustomTypeDb.setIndex('userId')

//-------------- Records --------------

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
  if (record.type === 'custom') {
    const types = await getCustomTypes({
      userId: user.id,
    })
    if (!types.find((t) => t.id === record.subtype)) {
      throw new UserError(ErrorCode.UNKNOWN_CUSTOM_TYPE)
    }
  }
  await RecordDb.add(record as Record)
  return record as Record
}

const getRecordById = async (id: string): Promise<Record | undefined> => {
  return await RecordDb.findOne({ id })
}

const getRecords = async (
  query: Partial<Record>,
  {
    limit,
    skip,
    sort = {
      time: -1,
    },
  }: FindOption<Record> = {},
): Promise<Record[]> => {
  const result = await RecordDb.find(query, { limit, skip, sort })
  return result
}

const updateRecord = async (
  record: Partial<Record> & { id: string },
): Promise<Record> => {
  const { id } = record
  const existed = await RecordDb.findOne({ id: record.id })
  if (!existed) {
    throw new UserError(ErrorCode.ITEM_INVALID)
  }
  if (record.type === 'custom' && record.subtype) {
    const types = await getCustomTypes({
      userId: existed.babyId,
    })
    if (!types.find((t) => t.id === record.subtype)) {
      throw new UserError(ErrorCode.UNKNOWN_CUSTOM_TYPE)
    }
  }
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

//--------------  Custom --------------

const createCustomType = async (
  custom: Records.CustomTypeDraft,
  user: User,
): Promise<CustomType> => {
  if (!user || !custom.name) {
    throw new Error('Invalid custom type')
  }
  const type: CustomType = {
    ...custom,
    userId: user.id,
    id: generateUuid(),
  }
  await CustomTypeDb.add(type)
  return type
}

const getCustomTypes = async (
  query: Partial<CustomType>,
  option: FindOption<CustomType> = {
    sort: {
      createdAt: 1,
    },
  },
): Promise<CustomType[]> => {
  return await CustomTypeDb.find(query, option)
}

const updateCustomType = async (
  type: Partial<CustomType> & { id: string },
): Promise<CustomType> => {
  const { id } = type
  if (!id) {
    throw new Error('requires `id` in custom type')
  }
  await CustomTypeDb.update({ id }, { ...type })
  const re = await CustomTypeDb.findOne({ id })
  return re!
}

const deleteCustomTypeById = async (id: string): Promise<number> => {
  if (await CustomTypeDb.findOne({ id })) {
    await CustomTypeDb.remove({ id })
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
    createCustomType,
    updateCustomType,
    getCustomTypes,
    deleteCustomTypeById,
  },
  'record',
)
