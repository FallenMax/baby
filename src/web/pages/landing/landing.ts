import m from 'mithril'
import { ErrorCode } from '../../../common/types'
import { isUserError } from '../../../common/util/error'
import { Button } from '../../component/button/button'
import { Field } from '../../component/field/field'
import { Logo } from '../../component/logo/logo'
import { showToast } from '../../component/toast/toast'
import { userService } from '../../service/user.service'
import { showError } from '../../util/client_error'
import './landing.scss'

export const LandingPage: m.FactoryComponent = () => {
  let isShowingAbout = false

  let name = ''
  let nameError = ''
  let password = ''
  let passwordError = ''

  const onRegisterOrLogin = async () => {
    // validate
    name = name.trim()
    if (!name) {
      nameError = 'baby name required'
    }
    if (!password) {
      passwordError = 'password required'
    } else if (!/^[a-zA-Z0-9]{6,}$/.test(password)) {
      passwordError = 'password must be at least 6 characters'
    }
    if (nameError || passwordError) {
      return
    }

    try {
      const { user, type } = await userService.registerOrLogin({
        name,
        password,
      })
      m.route.set(location.href.replace(location.origin, ''), null, {
        replace: true,
      })
      if (type === 'new') {
        setTimeout(function () {
          showToast('account created!')
        }, 0)
      } else {
        setTimeout(function () {
          showToast('logged in!')
        }, 0)
      }
    } catch (error) {
      console.log('error ', error)
      if (isUserError(error) && error.errcode) {
        switch (error.errcode) {
          case ErrorCode.REGISTER_INVALID_USERNAME: {
            nameError = 'pleast input baby name'
            break
          }
          case ErrorCode.REGISTER_INVALID_PASSWORD: {
            passwordError = 'password must be at least 6 characters'
            break
          }
          case ErrorCode.LOGIN_INCORRECT_NAME_PASS: {
            passwordError = 'account exists but password mismatch'
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
    view() {
      return m('#landing.f-col.f-c-center', [
        m('main.f-col.f-c-center', [
          m(Logo),
          m('.desc', 'daily record'),
          m(
            '.login-register-forms',
            m(
              'form.f-col#register-login',
              {
                onsubmit(e) {
                  console.log('e ', e)
                  e.preventDefault()
                  e.stopPropagation()
                },
              },
              [
                m(Field, {
                  id: 'name',
                  type: 'text',
                  required: true,
                  error: nameError,
                  autocomplete: 'name',
                  label: 'baby name',
                  value: name,
                  oninput(e) {
                    nameError = ''
                    name = (e.target as HTMLInputElement).value
                  },
                  onsubmit() {
                    onRegisterOrLogin()
                  },
                  onkeypress(e) {
                    if (e.key === 'Enter') {
                      onRegisterOrLogin()
                    }
                  },
                }),
                m(Field, {
                  id: 'password',
                  error: passwordError,
                  minLength: 6,
                  required: true,
                  type: 'password',
                  label: 'password',
                  value: password,
                  autocomplete: 'current-password',
                  placeholder: '',
                  oninput(e) {
                    passwordError = ''
                    password = (e.target as HTMLInputElement).value
                  },
                  onkeypress(e) {
                    if (e.key === 'Enter') {
                      onRegisterOrLogin()
                    }
                  },
                  onsubmit() {
                    onRegisterOrLogin()
                  },
                }),
                m('.password-hint', 'to register, enter a new password'),
                m(
                  '.f-center',
                  m(
                    Button,
                    {
                      // type: 'submit',// causes ios safari styling problem
                      onclick: onRegisterOrLogin,
                      class: 'register-button',
                    },
                    'register / login',
                  ),
                ),
              ],
            ),
          ),
        ]),

        m(
          '.about-page.f-center',
          {
            class: isShowingAbout ? 'is-active' : '',
          },
          [
            m('.about-text', [
              m('span.logo-name', 'baby'),
              ' is an easy, pressureless way to record life, share feelings and stay connected with best friends',
            ]),
          ],
        ),

        // m(
        //   '.button-about',
        //   { onclick: onToggleAbout },
        //   isShowingAbout ? '(close)' : '(about)',
        // ),
      ])
    },
  }
}
