import { ErrorCode, getMessage } from '../../common/types'
import { userService } from '../service/user.service'
import { ApiWithContext } from '../types/api'

export const userController: ApiWithContext['user'] = {
  getMe: async (_, ctx) => {
    const userId = ctx.session.userId
    if (!userId) return undefined
    const user = await userService.getById(userId)
    return user
  },

  logout: async (_, ctx) => {
    const userId = ctx.session.userId
    if (!userId) console.warn(getMessage(ErrorCode.LOGOUT_WHILE_NOT_LOGGED_IN))

    ctx.session = null as any
  },

  registerOrLogin: async ({ name, password }, ctx) => {
    const userId = ctx.session.userId
    if (userId) console.warn(getMessage(ErrorCode.LOGIN_WHILE_LOGGED_IN))

    let user = await userService.getByName(name)
    let type: 'new' | 'existed'
    if (user) {
      user = await userService.login({ name, password })
      type = 'existed'
    } else {
      user = await userService.register({ name, password })
      type = 'new'
    }
    ctx.session.userId = user.id
    return { user, type }
  },

  changePassword: async ({ password, newPassword }, ctx) => {
    const user = await userService.getUserOrThrow(ctx)
    await userService.changePassword({
      name: user.name,
      password,
      newPassword,
    })
  },
}
