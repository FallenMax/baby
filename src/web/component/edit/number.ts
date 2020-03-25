import m from 'mithril'
import { WiredInput, WiredSlider } from 'wired-elements'
import { use } from '../../util/use'
import './number.scss'
use(WiredSlider)
use(WiredInput)

const getNumberString = (number: number, unit: string) => {
  return `${number}${unit}`
}

export const round = (number: number, step: number) => {
  return Math.floor(number / step) * step
}

export type NumberEditorAttrs = {
  number: number
  min?: number
  max?: number
  step?: number
  unit: string
  onChange(number: number): void
}
export const NumberEditor: m.FactoryComponent<NumberEditorAttrs> = () => {
  return {
    oncreate() {
      setTimeout(function() {
        // for unknown reason, wired-input.number-input doesn't update
        // on first render
        m.redraw()
      }, 0)
    },
    view({ attrs: { number, step = 10, min = 0, max, unit, onChange } }) {
      return m('.number-editor', [
        m(
          '.f-row.f-c-end.f-m-end',
          m('wired-input.number-input.f-center', {
            type: 'number',
            value: number,
            onchange(e) {
              onChange(Number(e.target.value) || 0)
            },
          }),
          unit,
        ),
        max &&
          m('.number-slider-labels.f-v-center', [
            m('.slider-min', getNumberString(min, unit)),
            m('.f-1'),
            m('.slider-max', getNumberString(max, unit)),
          ]),
        max &&
          m('wired-slider.number-slider', {
            min: 0,
            max: max,
            step: step,
            value: number,
            onchange(e) {
              onChange(round(e.target.value, step))
            },
          }),
      ])
    },
  }
}
