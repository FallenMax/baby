import { api } from '../api'

export type User = {
  id: string
  name: string
  photo?: string
  bio?: string
}

const tagUser = (userId) => {
  try {
    gtag('set', { user_id: userId }) // 使用已登录的 user_id 来设置用户 ID。
  } catch (error) {}
}

export const userService = {
  me: undefined as User | undefined,

  async fetchCurrentUser(): Promise<void> {
    this.me = await api.user.getMe()
    if (this.me) {
      tagUser(this.me.id)
    }
  },

  async logout(): Promise<void> {
    await api.user.logout()
    this.me = undefined
    tagUser(undefined)
  },

  async changePassword({
    password,
    newPassword,
  }: {
    password: string
    newPassword: string
  }): Promise<void> {
    await api.user.changePassword({ password, newPassword })
  },

  async registerOrLogin({
    name,
    password,
  }: {
    name: string
    password: string
  }): Promise<{ user: User; type: 'new' | 'existed' }> {
    const { user, type } = await api.user.registerOrLogin({ name, password })
    this.me = user
    tagUser(this.me.id)
    return { user, type }
  },
}
