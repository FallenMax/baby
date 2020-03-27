import m from 'mithril'
import { WiredCard, WiredLink } from 'wired-elements'
import { isMobile } from '../../../common/util/env'
import { NavigationBar } from '../../component/navigation/navigation'
import { Overview } from '../../component/overview/overview'
import { recordService } from '../../service/record.service'
import { userService } from '../../service/user.service'
import { colors } from '../../style/color'
import { isWebApp } from '../../util/env'
import { use } from '../../util/use'
import { paths } from '../path'
import './home.scss'
use(WiredCard)
use(WiredLink)

let hasAnimated = false
export type HomePageAttrs = {}
export const HomePage: m.FactoryComponent<HomePageAttrs> = () => {
  return {
    oncreate() {
      window.scrollTo(0, 0)
      Promise.all([
        recordService.fetchRecords(),
        recordService.fetchCustomTypes(),
      ]).then(() => {
        m.redraw()
      })
    },
    onbeforeremove() {
      hasAnimated = true
    },
    view({ attrs }) {
      const { me } = userService
      const { records, recordsFetched } = recordService
      return m('#home', { class: hasAnimated ? 'no-animation' : '' }, [
        m(NavigationBar, {
          left: m(
            '.user-name',
            {
              onclick() {
                m.route.set(paths['/profile'])
              },
            },
            me ? me.name : '-',
          ),
          // center: m('.today.f-center', getDateString()),
          right: recordsFetched ? m(Overview, { records }) : null,
        }),

        m('.page-content', [
          // m('.baby-name', me ? me.name : '-'),

          m('.actions', [
            m(
              'wired-card.action.eat.f-center',
              {
                elevation: 3,
                fill: colors.eat,
                onclick() {
                  m.route.set(paths['/eat'])
                },
              },
              'eat',
            ),
            m(
              'wired-card.action.sleep.f-center',
              {
                elevation: 3,
                fill: colors.sleep,
                onclick() {
                  m.route.set(paths['/sleep'])
                },
              },
              'sleep',
            ),
            m(
              'wired-card.action.pisspoop.f-center',
              {
                elevation: 3,
                fill: colors.pisspoop,
                onclick() {
                  m.route.set(paths['/pisspoop'])
                },
              },
              [m('', 'piss'), m('', 'poop')],
            ),

            m(
              'wired-card.action.custom.f-center',
              {
                elevation: 3,
                fill: colors.custom,
                onclick() {
                  m.route.set(paths['/custom'])
                },
              },
              [m('', 'custom event')],
            ),
            m(
              'wired-card.action.statistics.f-center',
              {
                elevation: 3,
                fill: colors.statistics,
                onclick() {
                  m.route.set(paths['/statistics'])
                },
              },
              [m('', 'history'), m('', 'statistics')],
            ),
          ]),

          m('.footer.f-v-center', [
            isMobile &&
              !isWebApp && [
                m(
                  'wired-link',
                  {
                    onclick(e) {
                      e.preventDefault()
                      window.alert(
                        `open this page with default browser, then select "share -> add to home screen"`,
                      )
                      e.redraw = false
                    },
                  },
                  'add to home screen?',
                ),
              ],

            m('.f-1'),
            m(
              'wired-link',
              {
                async onclick(e) {
                  e.preventDefault()
                  e.redraw = false
                  await userService.logout()
                  m.route.set(paths['/'], null, { replace: true })
                  location.reload()
                },
              },
              'logout',
            ),
          ]),
        ]),
      ])
    },
  }
}
