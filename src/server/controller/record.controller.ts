import { ErrorCode } from '../../common/types'
import { UserError } from '../../common/util/error'
import { recordService } from '../service/record.service'
import { userService } from '../service/user.service'
import { ApiWithContext } from '../types/api'

export const recordController: ApiWithContext['record'] = {
  async createRecord(draft, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    if (!recordService.isContentValid(draft)) {
      throw new UserError(ErrorCode.ITEM_INVALID)
    }
    const record = await recordService.createRecord(draft, user)
    return record
  },

  async getMyRecords(_, ctx) {
    const user = await userService.getUserOrThrow(ctx)
    const Records = await recordService.getRecords({ babyId: user.id })
    return Records
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
}
