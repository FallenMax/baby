import m, { Attributes } from 'mithril'
import { WiredButton } from 'wired-elements'
import { use } from '../../util/use'
import './button.scss'
use(WiredButton)

export type ButtonAttrs = Attributes & {
  theme?: 'black' | 'blue' | 'transparent'
  block?: boolean
}
export const Button: m.FactoryComponent<ButtonAttrs> = () => {
  return {
    view({ attrs: { theme, block, ...rest }, children }) {
      return m(
        'wired-button.button',
        {
          onsubmit(e) {
            e.preventDefault()
          },
          elevation: '3',
          ...rest,
          class: [theme, block && 'block']
            .concat(rest.className, rest.class)
            .filter(Boolean)
            .join(' '),
        },
        children,
      )
    },
  }
}
