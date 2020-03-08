import m from 'mithril'
import { WiredInput } from 'wired-elements'
import { ErrorCode } from '../../../common/types'
import { isUserError } from '../../../common/util/error'
import { Button } from '../../component/button/button'
import { Field } from '../../component/field/field'
import { NavigationBar } from '../../component/navigation/navigation'
import { RecordField } from '../../component/record_field/record_field'
import { showToast } from '../../component/toast/toast'
import { userService } from '../../service/user.service'
import { showError } from '../../util/client_error'
import { use } from '../../util/use'
import './profile.scss'
use(WiredInput)

export type ProfilePageAttrs = {}
export const ProfilePage: m.FactoryComponent<ProfilePageAttrs> = () => {
  let password = ''
  let passwordError = ''
  let newPassword = ''
  let newPassword2 = ''
  let newPasswordError = ''
  let newPassword2Error = ''

  const onChangePassword = async () => {
    // validate
    if (!password) {
      passwordError = 'current password required'
    }
    if (!newPassword) {
      newPasswordError = 'please input new password'
    } else if (!/^[a-zA-Z0-9]{6,}$/.test(newPassword)) {
      newPasswordError = 'password must be at least 6 characters'
    } else if (newPassword === password) {
      newPasswordError = 'cannot use same password'
    }
    if (newPassword2 !== newPassword) {
      newPassword2Error = 'two passwords are different'
    }

    if (passwordError || newPasswordError || newPassword2Error) {
      return
    }
    try {
      await userService.changePassword({
        password,
        newPassword,
      })
      password = ''
      passwordError = ''
      newPassword = ''
      newPasswordError = ''
      newPassword2 = ''
      newPassword2Error = ''
      showToast('password changed!')
    } catch (error) {
      console.log('error ', error)
      if (isUserError(error) && error.errcode) {
        switch (error.errcode) {
          case ErrorCode.LOGIN_INCORRECT_NAME_PASS: {
            passwordError = 'password mismatch'
            break
          }
          case ErrorCode.REGISTER_INVALID_PASSWORD: {
            newPasswordError = 'password must be at least 6 characters'
            break
          }
          default:
            showError(error)
            break
        }
      } else {
        showError(error)
      }
    }
  }

  return {
    view({ attrs }) {
      return m('#profile', [
        m(NavigationBar, {
          center: m('.title.f-center', 'profile'),
        }),
        m(
          'form.profile-form',
          {
            onsubmit(e) {
              e.stopPropagation()
              e.preventDefault()
            },
          },
          [
            m(RecordField, { label: 'password', layout: 'column' }, [
              m('.password-form', [
                m(Field, {
                  id: 'password',
                  type: 'password',
                  minLength: 6,
                  required: true,
                  error: passwordError,
                  label: 'current password',
                  value: password,
                  oninput(e) {
                    passwordError = ''
                    password = (e.target as HTMLInputElement).value
                  },
                }),
                m(Field, {
                  id: 'new-password',
                  error: newPasswordError,
                  minLength: 6,
                  required: true,
                  type: 'password',
                  label: 'new password',
                  value: newPassword,
                  placeholder: '',
                  oninput(e) {
                    newPasswordError = ''
                    newPassword = (e.target as HTMLInputElement).value
                  },
                }),
                m(Field, {
                  id: 'new-password-2',
                  error: newPassword2Error,
                  minLength: 6,
                  required: true,
                  type: 'password',
                  label: 'confirm new password',
                  value: newPassword2,
                  placeholder: '',
                  oninput(e) {
                    newPassword2Error = ''
                    newPassword2 = (e.target as HTMLInputElement).value
                  },
                }),
                m(
                  Button,
                  {
                    // type: 'submit',// causes ios safari styling problem
                    onclick: onChangePassword,
                    class: 'submit-button',
                  },
                  'change password',
                ),
              ]),
            ]),

            // m('wired-divider.divider'),
          ],
        ),
      ])
    },
  }
}
