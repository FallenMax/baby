import m from 'mithril'
import { WiredButton } from 'wired-elements'
import { Records } from '../../../common/types'
import { showToast } from '../../component/toast/toast'
import { recordService } from '../../service/record.service'
import { showErrorOnFail } from '../../util/client_error'
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
              onclick: showErrorOnFail(async () => {
                if (!record) {
                  return
                }
                if (record.type === 'custom' && !record.subtype) {
                  showToast('add or select a custom type first')
                  return
                }
                await recordService.createRecord(record)
                history.back()
                showToast('record added')
              }),
            },
            'submit',
          ),
        attrs.type === 'update' &&
          m(
            'wired-card.update-button',
            {
              elevation: 3,
              onclick: showErrorOnFail(async () => {
                if (!record) {
                  return
                }
                await recordService.updateRecord({
                  id: attrs.guid,
                  ...record,
                })
                history.back()
                showToast('record updated')
              }),
            },
            'update',
          ),
        attrs.type === 'update' &&
          m(
            'wired-card.delete-button',
            {
              elevation: 3,
              onclick: showErrorOnFail(async () => {
                if (!record) {
                  return
                }
                if (!window.confirm('delete?')) {
                  return
                }

                await recordService.deleteRecord(attrs.guid)
                history.back()
                showToast('record deleted')
              }),
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
