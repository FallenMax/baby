import m from 'mithril'
import './textarea.scss'

export type TextAreaAttrs = Partial<HTMLTextAreaElement>
export const TextArea: m.FactoryComponent<TextAreaAttrs> = () => {
  return {
    view({ attrs }) {
      return m('textarea.textarea', attrs)
    },
  }
}
