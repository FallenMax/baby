;(function () {
  var isSupportedBrowser = typeof Proxy === 'function'
  if (!isSupportedBrowser) {
    document.body.textContent = 'Sorry, your current browser is not supported.'
    throw new Error('halt')
  }

  try {
    const Sentry = require('@sentry/browser')
    Sentry.init({
      dsn: 'https://4065b37e90d846f49e0ee629d985a60e@sentry.io/212251',,
      release: config.release
    })
  } catch (error) {
    console.error('failed to start sentry')
  }
})()

import m from 'mithril'
import { config } from './config'
import { CustomPage } from './pages/custom/custom'
import { CustomManagePage } from './pages/custom_manage/custom_manage'
import { EatPage } from './pages/eat/eat'
import { HomePage } from './pages/home/home'
import { LandingPage } from './pages/landing/landing'
import { paths } from './pages/path'
import { PissPoopPage } from './pages/pisspoop/pisspoop'
import { ProfilePage } from './pages/profile/profile'
import { SleepPage } from './pages/sleep/sleep'
import { StatisticsPage } from './pages/statistics/statistics'
import { userService } from './service/user.service'
import { showError } from './util/client_error'
import { parseURL } from './util/url'

const requireLogin = (
  pageComponent: m.ComponentTypes,
): m.ComponentTypes | undefined => {
  const me = userService.me
  if (!me) {
    m.route.set(`/?redirect_url=${encodeURIComponent(location.href)}`, null, {
      replace: true,
    })
  } else {
    return pageComponent
  }
}

const start = async () => {
  await Promise.all([
    userService.fetchCurrentUser(),
    (document as any).fonts?.load('12px Virgil'),
  ])

  m.route.prefix = '' // using the pathname

  const container = document.body.appendChild(document.createElement('div'))
  container.id = 'app'

  m.route(container, '/', {
    [paths['/']]: {
      onmatch: () => {
        const me = userService.me
        if (!me) {
          return LandingPage
        } else {
          let redirect_url = parseURL(location.href)?.searchParams?.get(
            'redirect_url',
          )
          redirect_url = redirect_url && decodeURIComponent(redirect_url)
          if (redirect_url) {
            const origin = parseURL(redirect_url)?.origin
            if (origin === location.origin) {
              m.route.set(redirect_url.replace(origin, ''), null, {
                replace: true,
              })
              return
            } else {
              m.route.set(paths['/home'], null, { replace: true })
            }
          } else {
            m.route.set(paths['/home'], null, { replace: true })
          }
        }
      },
    },
    [paths['/home']]: {
      onmatch: () => requireLogin(HomePage),
    },
    [paths['/eat']]: {
      onmatch: () => requireLogin(EatPage),
    },
    [paths['/eat/:guid']]: {
      onmatch: () => requireLogin(EatPage),
    },
    [paths['/sleep']]: {
      onmatch: () => requireLogin(SleepPage),
    },
    [paths['/sleep/:guid']]: {
      onmatch: () => requireLogin(SleepPage),
    },
    [paths['/pisspoop']]: {
      onmatch: () => requireLogin(PissPoopPage),
    },
    [paths['/pisspoop/:guid']]: {
      onmatch: () => requireLogin(PissPoopPage),
    },
    [paths['/custom']]: {
      onmatch: () => requireLogin(CustomPage),
    },
    [paths['/custom/:guid']]: {
      onmatch: () => requireLogin(CustomPage),
    },
    [paths['/custom_manage']]: {
      onmatch: () => requireLogin(CustomManagePage),
    },
    [paths['/statistics']]: {
      onmatch: () => requireLogin(StatisticsPage),
    },
    [paths['/profile']]: {
      onmatch: () => requireLogin(ProfilePage),
    },
  })
}

// @ts-ignore
window._m = m

start().catch(showError)
