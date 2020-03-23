import { keepTruthy } from './array/filter'

const pad = (num: number) => (num < 10 ? '0' + num : num)

export const MINUTE = 1000 * 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24

export const getTimeString = (d: Date): string => {
  const hour = d.getHours()
  const minute = d.getMinutes()
  const timeString = [hour, minute].map(pad).join(':')
  return timeString
}

export const getDateString = (d: Date, short = false) => {
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const thisYear = new Date().getFullYear()
  return short
    ? keepTruthy([year !== thisYear && year, month, day]).join('/')
    : [year, month, day].join('-')
}

export const parseDateString = (str: string): Date => {
  const [y, m, d] = str.split('-').map((val) => Number(val))
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

export const prettyTime = (minute: number | undefined) => {
  if (minute == null) return '-'
  const hour = Math.floor(minute / 60)
  const restMin = Math.floor(minute % 60)
  return keepTruthy([hour && `${hour}h`, `${restMin}m`]).join('')
}
