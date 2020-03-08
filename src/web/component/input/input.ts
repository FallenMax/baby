import m from 'mithril'
import { WiredInput } from 'wired-elements'
import { use } from '../../util/use'
import './input.scss'
use(WiredInput)

export type InputAttrs = Partial<HTMLInputElement> & {
  theme?: 'border' | 'transparent'
}
export const Input: m.FactoryComponent<InputAttrs> = () => {
  return {
    view({ attrs }) {
      return m('wired-input.input', attrs)
    },
  }
}

export type LabelAttrs = {}
export const Label: m.FactoryComponent<LabelAttrs> = () => {
  return {
    view({ attrs, children }) {
      return m('label.label', attrs, children)
    },
  }
}
