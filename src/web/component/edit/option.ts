import m from 'mithril'
import { WiredCard } from 'wired-elements'
import { use } from '../../util/use'
import './option.scss'
use(WiredCard)

export type OptionEditorAttrs = {
  options: { key: string; text: string }[]
  selected: string
  themeColor?: string
  onChange(key: string): void
}
export const OptionEditor: m.FactoryComponent<OptionEditorAttrs> = () => {
  return {
    view({ attrs: { options, selected, themeColor, onChange } }) {
      return m('.option-editor', [
        m(
          '.options.f-row.f-c-stretch.f-m-end',
          options.map((o) => {
            if (o.key === selected) {
              return m(
                'wired-card.option.f-center',
                {
                  class: 'is-selected',
                  key: o.key,
                  fill: themeColor || '#82c91e',
                  onclick() {
                    onChange(o.key)
                  },
                },
                o.text,
              )
            }
            return m(
              '.option.f-center',
              {
                key: o.key,
                onclick() {
                  onChange(o.key)
                },
              },
              o.text,
            )
          }),
        ),
      ])
    },
  }
}
