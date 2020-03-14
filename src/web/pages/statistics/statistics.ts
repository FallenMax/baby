import m from 'mithril'
import { Records } from '../../../common/types'
import { assertNever } from '../../../common/util/assert'
import {
  DAY,
  getDateString,
  getTimeString,
  HOUR,
  parseDateString,
} from '../../../common/util/time'
import { NavigationBar } from '../../component/navigation/navigation'
import { Overview } from '../../component/overview/overview'
import { recordService } from '../../service/record.service'
import { downloadURI } from '../../util/download'
import { paths } from '../path'
import { StatisticChart } from './charts'
import './statistics.scss'

const getDetailString = (rec: Records.Record): string => {
  switch (rec.type) {
    case 'eat': {
      switch (rec.food) {
        case 'baby_food':
          return 'baby food'
        case 'breast_milk':
          return `${rec.amount}ml breast milk`
        case 'formula_milk':
          return `${rec.amount}ml formula milk`

        default:
          return assertNever(rec.food)
      }
    }
    case 'piss':
    case 'poop':
    case 'sleep':
    case 'wakeup':
      return ''

    default:
      return assertNever(rec)
  }
}

export type RecordAttrs = {
  record: Records.Record
  onClick(record: Records.Record): void
}
export const Record: m.FactoryComponent<RecordAttrs> = () => {
  return {
    view({ attrs: { record, onClick } }) {
      return m(
        '.record-item.f-v-center',
        {
          class: record.type,
          onclick() {
            onClick(record)
          },
        },
        m('.record-item-content.f-row', [
          m('.time.f-v-center', getTimeString(record.time)),
          m('.record-content.f-1', [
            m(
              'span.type',
              {
                eat: 'eat',
                sleep: 'sleep',
                wakeup: 'wake up',
                piss: 'piss',
                poop: 'poop',
              }[record.type],
            ),
            m('span.detail', getDetailString(record)),
            record.note && m('span.note', `${record.note}`),
          ]),
        ]),
      )
    },
  }
}

const groupByDay = (records: Records.Record[]) => {
  const groups: Record<string, Records.Record[]> = {}
  records.forEach((record) => {
    const day = getDateString(record.time)
    if (!groups[day]) {
      groups[day] = []
    }
    groups[day].push(record)
  })
  return groups
}

/** start with waking up in current day, end with waking up in next day */
const groupBySleepCycle = (records: Records.Record[]) => {
  const groups = groupByDay(
    records.slice().sort((a, b) => a.time.getTime() - b.time.getTime()),
  )

  for (const day in groups) {
    if (groups.hasOwnProperty(day)) {
      const records = groups[day]
      const isMorning = (d: Date) => {
        return d.getTime() - parseDateString(day).getTime() < HOUR * 12
      }
      const morningSleepEventIndex = records.findIndex(
        (r) => (r.type === 'wakeup' || r.type === 'sleep') && isMorning(r.time),
      )
      if (morningSleepEventIndex !== -1) {
        const event = records[morningSleepEventIndex]
        if (event.type === 'wakeup') {
          // move these events to previous day
          const prevDay = getDateString(new Date(event.time.getTime() - DAY))
          if (!groups[prevDay]) {
            groups[prevDay] = []
          }
          groups[prevDay].push(...records.slice(0, morningSleepEventIndex + 1))
          groups[day] = records.slice(morningSleepEventIndex + 1)
        }
      }
    }
  }
  return groups
}

const selectRecordsWithinRange = (
  records: Records.Record[],
  days: number,
): Records.Record[] => {
  const start = new Date(
    parseDateString(getDateString(new Date())).getTime() - DAY * days,
  ).getTime()
  return records.filter((rec) => rec.time.getTime() >= start)
}

let scrollPosition = 0
export type StatisticsPageAttrs = {}
export const StatisticsPage: m.FactoryComponent<StatisticsPageAttrs> = () => {
  let dateRange: 7 | 30 = 7
  const startEdit = (rec: Records.Record) => {
    const path = {
      eat: paths['/eat'],
      sleep: paths['/sleep'],
      wakeup: paths['/sleep'],
      piss: paths['/pisspoop'],
      poop: paths['/pisspoop'],
    }[rec.type]

    m.route.set(path + '/' + rec.id)
  }

  const exportToCsv = async () => {
    if (!window.confirm(`export your data to csv file, continue?`)) {
      return
    }
    const csv = await recordService.exportRecords()
    const uri = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
    downloadURI(uri, `baby_records_${getDateString(new Date())}.csv`)
  }
  return {
    async oninit() {
      await recordService.fetchRecords()
      window.scrollTo(0, scrollPosition)
    },
    onbeforeremove() {
      scrollPosition = window.scrollY || window.pageYOffset || 0
    },
    view() {
      const { recordsFetched, records } = recordService
      const grouped = records && groupByDay(records)
      const today = getDateString(new Date())
      return m('#statistics', [
        m(NavigationBar, {
          center: m('.title.f-center', 'statistics'),
          right: m('.export-button', { onclick: exportToCsv }, 'export'),
        }),

        m('.page-content', [
          recordsFetched
            ? records.length
              ? [
                  m('section.today', [
                    m(
                      'wired-link.section-title',
                      {
                        onclick(e) {
                          e.preventDefault()
                        },
                      },
                      'today',
                    ),
                    m(Overview, { records, size: 'large' }),
                  ]),
                  m('section.statistics', [
                    m(
                      'wired-link.section-title',
                      {
                        onclick(e) {
                          e.preventDefault()
                        },
                      },
                      'statistics',
                    ),
                    m('', [
                      m('.chart-select.f-v-center', [
                        m(
                          '.chart-option',
                          {
                            class: dateRange === 7 ? 'is-selected' : '',
                            onclick() {
                              dateRange = 7
                            },
                          },
                          '7-days',
                        ),
                        m(
                          '.chart-option',
                          {
                            class: dateRange === 30 ? 'is-selected' : '',
                            onclick() {
                              dateRange = 30
                            },
                          },
                          '30-days',
                        ),
                      ]),
                      m(StatisticChart, {
                        dateRange: dateRange,
                        records: groupBySleepCycle(
                          selectRecordsWithinRange(records, dateRange),
                        ),
                      }),
                    ]),
                  ]),
                  m('section.history', [
                    m(
                      'wired-link.section-title',
                      {
                        async onclick(e) {
                          e.preventDefault()
                          await recordService.fetchRecords({ force: true })
                        },
                      },
                      'history',
                    ),

                    Object.entries(grouped).map(([day, records]) => {
                      return [
                        m(
                          '.record-day',
                          { key: day },
                          `${day}${day === today ? ' (today)' : ''}`,
                        ),
                        m(
                          '.record-list',
                          { key: day + '-records' },
                          records.map((record) => {
                            return m(Record, {
                              record,
                              key: day + record.id,
                              onClick: startEdit,
                            })
                          }),
                        ),
                      ]
                    }),
                  ]),
                ]
              : m('.empty.f-center', 'no records yet')
            : null,
        ]),
      ])
    },
  }
}
