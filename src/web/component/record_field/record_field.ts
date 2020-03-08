import m from 'mithril'
import { colors } from '../../style/color'
import './record_field.scss'

export type RecordFieldAttrs = {
  label: string
  layout?: 'row' | 'column'
}
export const RecordField: m.FactoryComponent<RecordFieldAttrs> = () => {
  return {
    view({ attrs, children }) {
      return m(
        '.fieldset',
        {
          class: [
            attrs.layout === 'column' ? 'f-col' : 'f-row',
            `layout-${attrs.layout || 'row'}`,
          ].join(' '),
        },
        [
          m(
            '.field-label',
            {
              fill: colors.theme,
            },
            attrs.label,
          ),
          m('.field-content.f-1', children),
        ],
      )
    },
  }
}
