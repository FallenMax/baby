import m from 'mithril'
import { WiredButton } from 'wired-elements'
import { Records } from '../../../common/types'
import { showToast } from '../../component/toast/toast'
import { recordService } from '../../service/record.service'
import { use } from '../../util/use'
import './form_footer.scss'
use(WiredButton)

export type RecordSubmitAttrs =
  | {
      type: 'create'
      record: Records.RecordDraft
    }
  | {
      type: 'update'
      record: Records.RecordDraft
      guid: string
    }
export const RecordSubmit: m.FactoryComponent<RecordSubmitAttrs> = () => {
  return {
    view({ attrs }) {
      const { record } = attrs
      return m('.record-submit-footer', [
        attrs.type === 'create' &&
          m(
            'wired-card.create-button',
            {
              elevation: 3,
              async onclick() {
                if (!record) {
                  return
                }
                try {
                  await recordService.createRecord(record)
                  history.back()
                  showToast('record added')
                } catch (error) {
                  showToast('failed', { type: 'error' })
                  console.error(error)
                }
              },
            },
            'submit',
          ),
        attrs.type === 'update' &&
          m(
            'wired-card.update-button',
            {
              elevation: 3,
              async onclick() {
                if (!record) {
                  return
                }
                try {
                  await recordService.updateRecord({
                    id: attrs.guid,
                    ...record,
                  })
                  history.back()
                  showToast('record updated')
                } catch (error) {
                  showToast('failed', { type: 'error' })
                  console.error(error)
                }
              },
            },
            'update',
          ),
        attrs.type === 'update' &&
          m(
            'wired-card.delete-button',
            {
              elevation: 3,
              async onclick() {
                if (!record) {
                  return
                }
                if (!window.confirm('delete?')) {
                  return
                }

                try {
                  await recordService.deleteRecord(attrs.guid)
                  history.back()
                  showToast('record deleted')
                } catch (error) {
                  showToast('failed', { type: 'error' })
                  console.error(error)
                }
              },
            },
            'delete',
          ),
      ])
    },
  }
}

export type FormFooterAttrs = {}
export const FormFooter: m.FactoryComponent<FormFooterAttrs> = () => {
  return {
    view({ attrs, children }) {
      return m('', [m('.form-footer-placeholder'), m('.form-footer', children)])
    },
  }
}
