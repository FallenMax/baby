import m from 'mithril'
import './logo.scss'

export type LogoAttrs = {
  size: number
}
export const Logo: m.FactoryComponent<LogoAttrs & m.Attributes> = () => {
  return {
    view({ attrs }) {
      return m(
        '.logo',
        {
          ...attrs,
          style: {
            ...attrs.style,
            fontSize: `${attrs.size || 64}px`,
          },
        },
        ['baby'],
      )
    },
  }
}
