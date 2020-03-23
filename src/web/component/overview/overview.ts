import m from 'mithril'
import { Records } from '../../../common/types'
import { assertNever } from '../../../common/util/assert'
import { MINUTE, prettyTime } from '../../../common/util/time'
import './overview.scss'

type Overview = {
  eatCount: number
  eatAmount: number
  minuteSinceLastMeal: number | undefined
  minuteSlept: number
  pissCount: number
  poopCount: number
}

export const getOverview = (records: Records.Record[]): Overview => {
  const now = new Date()
  const dayStart = new Date()
  dayStart.setHours(0)
  dayStart.setMinutes(0)
  dayStart.setSeconds(0)
  dayStart.setMilliseconds(0)

  let eatCount = 0
  let eatAmount = 0
  let sleepDurationMs = 0
  let isSleeping = false
  let sleepStart: undefined | Date = undefined
  let pissCount = 0
  let poopCount = 0
  let lastMeal: undefined | Date = undefined

  const recordsToday = records
    .filter((rec) => {
      const time = rec.time
      const year = time.getFullYear()
      const month = time.getMonth()
      const day = time.getDate()
      return (
        year === now.getFullYear() &&
        month === now.getMonth() &&
        day === now.getDate()
      )
    })
    .sort((a, b) => a.time.getTime() - b.time.getTime())

  recordsToday.forEach((rec) => {
    switch (rec.type) {
      case 'eat': {
        eatCount++
        lastMeal = rec.time
        switch (rec.food) {
          case 'breast_milk':
          case 'formula_milk':
            eatAmount += Number(rec.amount || 0)
            break
        }
        break
      }

      case 'piss':
        pissCount++
        break

      case 'poop':
        poopCount++
        break

      case 'sleep':
        isSleeping = true
        sleepStart = rec.time
        break

      case 'wakeup':
        isSleeping = false
        if (sleepStart != null) {
          // not first wakeup
          sleepDurationMs += rec.time.getTime() - sleepStart.getTime()
        }
        break

      default:
        assertNever(rec)
        break
    }
  })

  if (isSleeping && sleepStart) {
    sleepDurationMs += now.getTime() - sleepStart!.getTime()
  }

  const minuteSinceLastMeal = lastMeal
    ? Math.floor((now.getTime() - lastMeal!.getTime()) / MINUTE)
    : undefined

  const minuteSlept = Math.floor(sleepDurationMs / MINUTE)

  const overview = {
    eatCount,
    eatAmount,
    minuteSinceLastMeal,
    minuteSlept,
    pissCount,
    poopCount,
  }
  return overview
}

export type OverviewAttrs = {
  records: Records.Record[]
  size?: 'compact' | 'large'
}
export const Overview: m.FactoryComponent<OverviewAttrs> = () => {
  return {
    view({ attrs: { size = 'compact', records } }) {
      const {
        eatCount,
        eatAmount,
        minuteSinceLastMeal,
        minuteSlept,
        pissCount,
        poopCount,
      } = getOverview(records)

      const gap = size === 'compact' ? '' : ''

      const eat = `🍼${gap}${eatCount}/${eatAmount}ml/${prettyTime(
        minuteSinceLastMeal,
      )}`
      const sleep = `🛏️${gap}${prettyTime(minuteSlept)}`
      const piss = `💦${gap}${pissCount}`
      const poop = `💩${gap}${poopCount}`

      return m(
        '.overview.f-v-center',
        { class: `size-${size}` },
        [eat, sleep, piss, poop].map((item) => m('.part', item)),
      )
    },
  }
}
