import m from 'mithril'
import { WiredSlider } from 'wired-elements'
import { getDateString, getTimeString } from '../../util/time'
import { use } from '../../util/use'
import './time.scss'
use(WiredSlider)

const bound = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

export const round = (date: Date, precisionMin = 5) => {
  const next = new Date(date)
  const min = Math.floor(date.getMinutes() / precisionMin) * precisionMin
  next.setMinutes(min)
  next.setSeconds(0)
  next.setMilliseconds(0)
  return next
}

const MIN_EARLIER_MAX = 60

export type TimeEditorAttrs = {
  time: Date
  onChange(time: Date): void
}
export const TimeEditor: m.FactoryComponent<TimeEditorAttrs> = () => {
  let dom: HTMLElement
  let dateInput: HTMLInputElement
  let timeInput: HTMLInputElement
  return {
    oncreate(vnode) {
      dom = vnode.dom as HTMLElement
      dateInput = dom.querySelector('input[type=date]') as HTMLInputElement
      timeInput = dom.querySelector('input[type=time]') as HTMLInputElement
      setTimeout(function() {
        m.redraw()
      }, 0)
    },
    view({ attrs: { time, onChange } }) {
      const minsAgo =
        (round(new Date()).getTime() - round(time).getTime()) / (1000 * 60)

      return m('.time-editor', [
        m('.f-row.f-m-end', [
          m(
            'wired-link.date-display.f-center',
            {
              onclick(e) {
                e.preventDefault()
                dateInput.focus()
              },
            },
            getDateString(time, true),
          ),
          m(
            'wired-link.time-display.f-center',
            {
              onclick(e) {
                e.preventDefault()
                timeInput.focus()
              },
            },
            getTimeString(time),
          ),
        ]),
        m('input.date', {
          type: 'date',
          value: getDateString(time),
          onchange(e) {
            if (!e.target.value) {
              onChange(new Date())
            } else {
              const [y, m, d] = e.target.value.split('-')
              time.setFullYear(y)
              time.setMonth(m - 1)
              time.setDate(d)
              onChange(time)
            }
          },
        }),
        m('input.time', {
          type: 'time',
          value: getTimeString(time),
          onchange(e) {
            if (!e.target.value) {
              onChange(new Date())
            } else {
              const [h, m] = e.target.value.split(':')
              time.setHours(h)
              time.setMinutes(m)
              time.setSeconds(0)
              time.setMilliseconds(0)
              onChange(time)
            }
          },
        }),
        m('.time-slider-labels.f-v-center', [
          m('.slider-min', 'now'),
          m('.f-1'),
          m(
            '.slider-max',
            `${Math.round((Math.max(MIN_EARLIER_MAX, minsAgo) / 60) * 10) /
              10}h ago`,
          ),
        ]),
        m('wired-slider.time-slider', {
          min: 0,
          max: MIN_EARLIER_MAX,
          step: 5,
          value: bound(minsAgo, 0, MIN_EARLIER_MAX),
          onchange(e) {
            onChange(
              round(
                new Date(
                  round(new Date()).getTime() - e.target.value * 1000 * 60,
                ),
              ),
            )
          },
        }),
      ])
    },
  }
}
