import { ErrorCode } from '../../common/types'
import { UserError } from '../../common/util/error'
import { recordService } from '../service/record.service'
import { userService } from '../service/user.service'
import { ApiWithContext } from '../types/api'

export const recordController: ApiWithContext['record'] = {
  //-------------- record --------------

  async createRecord(draft, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    if (!recordService.isContentValid(draft)) {
      throw new UserError(ErrorCode.ITEM_INVALID)
    }
    const record = await recordService.createRecord(draft, user)
    return record
  },

  async getMyRecords({ limit, skip }, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const records = await recordService.getRecords(
      { babyId: user.id },
      { limit, skip },
    )
    return records
  },

  async getMyRecordById({ id }, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const [record] = await recordService.getRecords({ babyId: user.id, id })
    return record
  },

  async updateRecord(update, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const [existed] = await recordService.getRecords({
      babyId: user.id,
      id: update.id,
    })
    if (!existed) {
      throw new UserError(ErrorCode.UPDATE_ITEM_NOT_FOUND)
    }
    if (!recordService.isContentValid(update)) {
      throw new UserError(ErrorCode.ITEM_INVALID)
    }
    return await recordService.updateRecord(update)
  },

  async deleteRecord({ id }, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const [existed] = await recordService.getRecords({
      babyId: user.id,
      id: id,
    })
    if (!existed) {
      throw new UserError(ErrorCode.DELETE_ITEM_NOT_FOUND)
    }
    return await recordService.deleteRecordById(id)
  },

  //-------------- custom type --------------

  async createCustomType(draft, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const record = await recordService.createCustomType(draft, user)
    return record
  },

  async getMyCustomTypes(_, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const Records = await recordService.getCustomTypes({ userId: user.id })
    return Records
  },

  async updateCustomType(update, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const [existed] = await recordService.getCustomTypes({
      userId: user.id,
      id: update.id,
    })
    if (!existed) {
      throw new UserError(ErrorCode.UPDATE_ITEM_NOT_FOUND)
    }
    if (!recordService.isContentValid(update)) {
      throw new UserError(ErrorCode.ITEM_INVALID)
    }
    return await recordService.updateCustomType(update)
  },

  async deleteCustomType({ id }, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const [existed] = await recordService.getCustomTypes({
      userId: user.id,
      id: id,
    })
    if (!existed) {
      throw new UserError(ErrorCode.DELETE_ITEM_NOT_FOUND)
    }
    return await recordService.deleteCustomTypeById(id)
  },
}
