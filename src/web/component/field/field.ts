import m from 'mithril'
import { Input } from '../input/input'
import './field.scss'

export type InputAttrs = {
  error?: string
  label?: string
}

export const Field: m.FactoryComponent<InputAttrs &
  Partial<HTMLInputElement>> = () => {
  return {
    view({ attrs }) {
      return m('.field', [
        attrs.error
          ? m('label.hint.error.f-v-center', { for: attrs.id }, attrs.error)
          : attrs.label
          ? m('label.hint.f-v-center', { for: attrs.id }, attrs.label)
          : null,
        m(Input, attrs),
      ])
    },
  }
}
