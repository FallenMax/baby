import m from 'mithril'
import { WiredCard } from 'wired-elements'
import { use } from '../../util/use'
import './colorselect.scss'
use(WiredCard)

const availColors = [
  ['#ced4da', '#868e96', '#fa5252', '#e64980'],
  ['#be4bdb', '#7950f2', '#4c6ef5', '#228be6'],
  ['#15aabf', '#12b886', '#40c057', '#82c91e'],
  ['#fab005', '#fd7e14'],
]
export type ColorSelectAttrs = {
  value: string
  onChange(value: string): void
}
export const ColorSelect: m.FactoryComponent<ColorSelectAttrs> = () => {
  let isActive = false
  const startSelect = () => {
    isActive = true
  }
  return {
    view({ attrs, children }) {
      return m('.color-select', [
        isActive &&
          m('.color-mask', {
            onclick() {
              isActive = false
            },
          }),
        isActive &&
          m(
            'wired-card.color-modal',
            availColors.map((group) => {
              return m(
                '.color-row.f-row.f-m-start.f-c-center',
                group.map((color) => {
                  return m('wired-card.color-option.f-1', {
                    class: color === attrs.value ? 'is-selected' : '',
                    // style: {
                    //   background: color,
                    // },
                    fill: color,
                    onclick() {
                      isActive = false
                      attrs.onChange(color)
                    },
                  })
                }),
              )
            }),
          ),

        m(
          '',
          {
            onclick() {
              startSelect()
            },
          },
          children,
        ),
      ])
    },
  }
}
