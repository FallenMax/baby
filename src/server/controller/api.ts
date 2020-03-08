import { ApiWithContext } from '../types/api'
import { recordController } from './record.controller'
import { userController } from './user.controller'

export const api: ApiWithContext = {
  user: userController,
  record: recordController,
}
