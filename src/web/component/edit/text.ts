import m from 'mithril'
import { WiredInput } from 'wired-elements'
import { use } from '../../util/use'
import './text.scss'

use(WiredInput)

export type TextEditorAttrs = {
  text: string
  onChange(text: string): void
}
export const TextEditor: m.FactoryComponent<TextEditorAttrs> = () => {
  return {
    view({ attrs }) {
      return m('.text-editor', [
        m('wired-input.text-input.f-v-center', {
          value: attrs.text,
          rows: 1,
          maxrows: 6,
          onchange(e) {
            attrs.onChange(e.target.value)
          },
        }),
      ])
    },
  }
}
