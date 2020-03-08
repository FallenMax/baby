import m from 'mithril'
import { WiredDivider } from 'wired-elements'
import { use } from '../../util/use'
import './navigation.scss'
use(WiredDivider)

export type BackButtonAttrs = {}
export const BackButton: m.FactoryComponent<BackButtonAttrs> = () => {
  return {
    view({ attrs }) {
      return m(
        '.back-button',
        {
          onclick() {
            history.back()
          },
        },
        '← back',
      )
    },
  }
}

export type NavigationBarAttrs = {
  left?: m.Vnode<any, any> | string | number | null | undefined
  center?: m.Vnode<any, any> | string | number | null | undefined
  right?: m.Vnode<any, any> | string | number | null | undefined
}
export const NavigationBar: m.FactoryComponent<NavigationBarAttrs> = () => {
  return {
    view({ attrs: { left, center, right } }) {
      return m('.navigation', [
        m('.navigation-bar-placeholder'),
        m('.navigation-bar.f-v-center', [
          m('.left.f-1', left || [m(BackButton)]),
          m('.center.f-1.f-center', center),
          m('.right.f-1.f-row.f-m-end', right),
        ]),
      ])
    },
  }
}
