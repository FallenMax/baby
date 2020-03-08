import m from 'mithril'
import { Records } from '../../common/types'
import { api } from '../api'

type Record = Records.Record
type Draft = Records.RecordDraft

export const recordService = {
  recordsFetched: false,
  getDefaultAmount() {
    return 100
  },
  records: [] as Record[],
  async createRecord(record: Draft) {
    await api.record.createRecord(record)
    this.fetchRecords({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
  async fetchRecords(options?: { force?: boolean }) {
    const { force = false } = options || {}
    if (this.recordsFetched && !force) {
      return
    }
    this.records = (await api.record.getMyRecords({}))
      .map((r) => {
        r.time = new Date(r.time)
        return r
      })
      .sort((a, b) => b.time.getTime() - a.time.getTime())
    this.recordsFetched = true
    m.redraw()
  },
  async fetchSingleRecord(id: string) {
    const record = await api.record.getMyRecordById({ id })
    if (record) {
      record.time = new Date(record.time)
    }
    return record
  },
  async updateRecord(record: Draft & { id: string }) {
    await api.record.updateRecord(record)
    this.fetchRecords({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
  async deleteRecord(id: string) {
    await api.record.deleteRecord({ id })
    this.fetchRecords({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
  async exportRecords() {
    await recordService.fetchRecords()
    const m = await import('papaparse')
    const csv = m.unparse(
      recordService.records.map((r) => {
        return {
          time: r.time.toISOString(),
          type: r.type,
          food_type: r.type === 'eat' ? r.food : '',
          food_amount: r.type === 'eat' ? r.amount ?? '' : '',
          note: r.note || '',
        }
      }),
    )
    return csv
  },
}

// @ts-ignore
// window.Recordservice = Recordservice
