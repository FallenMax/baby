import m from 'mithril'
import { WiredButton, WiredCard, WiredDivider, WiredLink } from 'wired-elements'
import { Records } from '../../../common/types'
import { OptionEditor } from '../../component/edit/option'
import { TextEditor } from '../../component/edit/text'
import { TimeEditor } from '../../component/edit/time'
import { NavigationBar } from '../../component/navigation/navigation'
import { RecordField } from '../../component/record_field/record_field'
import { recordService } from '../../service/record.service'
import { colors } from '../../style/color'
import { use } from '../../util/use'
import { FormFooter, RecordSubmit } from '../form/form_footer'
import './pisspoop.scss'
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

export type PissPoopPageAttrs = {}
export const PissPoopPage: m.FactoryComponent<PissPoopPageAttrs> = () => {
  let action: 'create' | 'update'
  let guid: string | undefined
  let record: Records.PissPoop | undefined
  return {
    async oncreate(vnode) {
      window.scrollTo(0, 0)
      guid = m.route.param('guid')
      if (guid) {
        action = 'update'
        record = (await recordService.fetchSingleRecord(
          guid,
        )) as Records.PissPoop
      } else {
        action = 'create'
        record = {
          time: round(new Date()),
          type: 'piss',
        }
      }
      m.redraw()
    },
    view() {
      return m('#pisspoop', [
        m(NavigationBar, {
          center: m('.title.f-center', 'piss/poop'),
        }),
        record &&
          m(
            'form.pisspoop-form',
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
                  themeColor: colors.pisspoop,
                  selected: record.type,
                  options: [
                    { key: 'piss', text: 'Piss' },
                    { key: 'poop', text: 'Poop' },
                  ],
                  onChange(key) {
                    record!.type = key as 'piss' | 'poop'
                  },
                }),
              ]),

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
