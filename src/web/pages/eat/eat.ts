import m from 'mithril'
import { WiredButton, WiredCard, WiredDivider, WiredLink } from 'wired-elements'
import { Records } from '../../../common/types'
import { NumberEditor } from '../../component/edit/number'
import { OptionEditor } from '../../component/edit/option'
import { TextEditor } from '../../component/edit/text'
import { TimeEditor } from '../../component/edit/time'
import { NavigationBar } from '../../component/navigation/navigation'
import { RecordField } from '../../component/record_field/record_field'
import { recordService } from '../../service/record.service'
import { colors } from '../../style/color'
import { use } from '../../util/use'
import { FormFooter } from '../form/form_footer'
import './eat.scss'
use(WiredCard)
use(WiredDivider)
use(WiredLink)
use(WiredButton)

const round = (date: Date, precisionMin = 5) => {
  const next = new Date(date)
  const min = Math.floor(date.getMinutes() / precisionMin) * precisionMin
  next.setMinutes(min)
  next.setSeconds(0)
  next.setMilliseconds(0)
  return next
}

export type EatPageAttrs = {}
export const EatPage: m.FactoryComponent<EatPageAttrs> = () => {
  let action: 'create' | 'update'
  let guid: string | undefined
  let record: Records.Eat | undefined

  return {
    async oncreate(vnode) {
      window.scrollTo(0, 0)
      guid = m.route.param('guid')
      if (guid) {
        action = 'update'
        record = (await recordService.fetchSingleRecord(guid)) as Records.Eat
      } else {
        action = 'create'
        record = {
          time: round(new Date()),
          type: 'eat',
          food: 'breast_milk',
          amount: 100,
        }
      }
      m.redraw()
    },
    view() {
      return m('#eat', [
        m(NavigationBar, {
          center: m('.title.f-center', 'eat'),
        }),
        record &&
          m(
            'form.eat-form',
            {
              onsubmit(e) {
                e.stopPropagation()
                e.preventDefault()
              },
            },
            [
              m(RecordField, { label: 'when' }, [
                m(TimeEditor, {
                  time: record.time,
                  onChange(t) {
                    record!.time = t
                  },
                }),
              ]),

              m('wired-divider.divider'),

              m(RecordField, { label: 'what' }, [
                m(OptionEditor, {
                  themeColor: colors.eat,
                  selected: record.food,
                  options: [
                    { key: 'breast_milk', text: 'Breast Milk' },
                    { key: 'formula_milk', text: 'Formula Milk' },
                    { key: 'baby_food', text: 'Baby Food' },
                  ],
                  onChange(key) {
                    if (!record) {
                      return
                    }
                    record.food = key as Records.Food
                    if (Records.foodHasAmount(record.food)) {
                      if (record.amount == null) {
                        record.amount = recordService.getDefaultAmount()
                      }
                    } else {
                      record.amount = undefined
                    }
                  },
                }),
              ]),

              Records.foodHasAmount(record.food) && [
                m('wired-divider.divider'),

                m(RecordField, { label: 'how much' }, [
                  m(NumberEditor, {
                    number: record.amount ?? recordService.getDefaultAmount(),
                    max: 240,
                    step: 10,
                    unit: 'ml',
                    onChange(val) {
                      if (!record) {
                        return
                      }
                      record.amount = val
                    },
                  }),
                ]),
              ],

              m('wired-divider.divider'),

              m(RecordField, { label: 'note' }, [
                m(TextEditor, {
                  text: record.note ?? '',
                  onChange(text) {
                    record!.note = text
                  },
                }),
              ]),

              action &&
                record &&
                m(
                  FormFooter,
                  action === 'create'
                    ? {
                        type: action,
                        record,
                      }
                    : {
                        type: action,
                        record,
                        guid: guid!,
                      },
                ),
            ],
          ),
      ])
    },
  }
}
