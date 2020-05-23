import m from 'mithril'
import { Records } from '../../common/types'
import { assertNever } from '../../common/util/assert'
import { api } from '../api_client'

type Record = Records.Record
type RecordDraft = Records.RecordDraft
type CustomType = Records.CustomType
type CustomTypeDraft = Records.CustomTypeDraft

export const recordService = {
  //-------------- Records --------------

  records: [] as Record[],
  recordsFetching: false,
  recordsFetched: false,
  recordsFetchedAll: false,
  getDefaultAmount() {
    return 100
  },
  getRecordName(record: Record) {
    switch (record.type) {
      case 'eat':
      case 'piss':
      case 'poop':
      case 'sleep':
        return record.type
      case 'wakeup':
        return 'wakeup'
      case 'custom': {
        const type = recordService.customTypes.find(
          (t) => t.id === record.subtype,
        )
        if (type) {
          return type.name
        } else {
          return '...'
        }
      }
      default:
        return assertNever(record)
    }
  },
  async createRecord(record: RecordDraft) {
    await api.record.createRecord(record)
    this.fetchRecords({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
  async fetchRecords({ force = false, limit = 0 } = {}) {
    if (this.recordsFetching) {
      return
    }
    try {
      this.recordsFetching = true

      if (force) {
        this.recordsFetchedAll = false
        this.records = (
          await api.record.getMyRecords({
            skip: 0,
            limit: limit || this.records.length,
          })
        ).sort((a, b) => b.time.getTime() - a.time.getTime())
        this.recordsFetched = true
        return
      }
      if (this.recordsFetchedAll) {
        return
      }
      const skip = this.records.length

      if (!limit && skip === 0) {
        limit = 200
      }
      if (!limit) {
        return
      }
      const next = await api.record.getMyRecords({ skip, limit })
      if (next.length < limit) {
        this.recordsFetchedAll = true
      }
      this.records = this.records.concat(next)
      this.recordsFetched = true
    } catch (e) {
      throw e
    } finally {
      this.recordsFetching = false
    }
  },
  async fetchSingleRecord(id: string) {
    const record = await api.record.getMyRecordById({ id })
    return record
  },
  async updateRecord(record: RecordDraft & { id: string }) {
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
    await recordService.fetchRecords({ force: true, limit: 1e8 })
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

  //-------------- Custom Events --------------

  customTypes: [] as CustomType[],
  customTypesFetched: false,
  defaultTypeColor: '#000000',
  defaultTypeIcon: '❤️',
  getCustomIcon(subtype: string) {
    const type = recordService.customTypes.find((t) => t.id === subtype)
    if (type) {
      return type.emoji || recordService.defaultTypeIcon
    } else {
      return recordService.defaultTypeIcon
    }
  },
  getCustomColor(subtype: string) {
    const type = recordService.customTypes.find((t) => t.id === subtype)
    if (type) {
      return type.color || recordService.defaultTypeColor
    } else {
      return recordService.defaultTypeColor
    }
  },
  async createCustomType(type: CustomTypeDraft) {
    await api.record.createCustomType(type)
    this.fetchCustomTypes({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
  async fetchCustomTypes(options?: { force?: boolean }) {
    const { force = false } = options || {}
    if (this.customTypesFetched && !force) {
      return
    }
    this.customTypes = await api.record.getMyCustomTypes({})
    this.customTypesFetched = true
    m.redraw()
  },
  async updateCustomType(type: CustomTypeDraft & { id: string }) {
    await api.record.updateCustomType(type)
    this.fetchCustomTypes({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
  async deleteCustomType(id: string) {
    await api.record.deleteCustomType({ id })
    this.fetchCustomTypes({ force: true }).catch((e) => console.error(e))
    m.redraw()
  },
}

// @ts-ignore
// window.Recordservice = Recordservice
