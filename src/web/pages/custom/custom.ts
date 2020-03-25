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
import { FormFooter, RecordSubmit } from '../form/form_footer'
import { paths } from '../path'
import './custom.scss'
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

export type CustomPageAttrs = {}
export const CustomPage: m.FactoryComponent<CustomPageAttrs> = () => {
  let action: 'create' | 'update'
  let guid: string | undefined
  let record: Records.Custom | undefined

  return {
    async oncreate(vnode) {
      window.scrollTo(0, 0)
      guid = m.route.param('guid')
      await recordService.fetchCustomTypes({ force: true })
      if (guid) {
        action = 'update'
        record = (await recordService.fetchSingleRecord(guid)) as Records.Custom
      } else {
        action = 'create'
        record = {
          time: round(new Date()),
          type: 'custom',
          subtype: recordService.customTypes[0]?.id,
          amount: 0,
        }
      }
      m.redraw()
    },
    view() {
      return m('#custom', [
        m(NavigationBar, {
          center: m('.title.f-center', 'custom event'),
        }),
        record &&
          m(
            'form.custom-form',
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
                m('.manage-types.f-col.f-c-end', [
                  m(
                    'a.manage-type-link',
                    {
                      async onclick(e) {
                        e.preventDefault()
                        e.redraw = false
                        m.route.set(paths['/custom_manage'])
                      },
                    },
                    recordService.customTypesFetched &&
                      recordService.customTypes.length === 0
                      ? 'add >'
                      : 'edit >',
                  ),
                  m(OptionEditor, {
                    themeColor: colors.custom,
                    selected: record.subtype,
                    options: recordService.customTypes.map((type) => {
                      return { key: type.id, text: type.name }
                    }),
                    onChange(key) {
                      if (!record) {
                        return
                      }
                      record.subtype = key
                    },
                  }),
                ]),
              ]),

              m('wired-divider.divider'),

              m(RecordField, { label: 'how much' }, [
                m(NumberEditor, {
                  number: record.amount ?? recordService.getDefaultAmount(),
                  unit: '',
                  onChange(val) {
                    if (!record) {
                      return
                    }
                    record.amount = val
                  },
                }),
              ]),
              ,
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
                m(FormFooter, [
                  m(
                    RecordSubmit,
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
                ]),
            ],
          ),
      ])
    },
  }
}
