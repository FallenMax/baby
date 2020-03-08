import { keepTruthy } from '../../common/util/array/filter'

const pad = (num: number) => (num < 10 ? '0' + num : num)

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

export const parseTimeString = (str: string) => {
  const [hour, minute] = str.split(':')
  let date = new Date()
  date.setHours(Number(hour))
  date.setMinutes(Number(minute))
  const now = new Date()
  if (date.getTime() > now.getTime()) {
    date = new Date(date.getTime() - 1000 * 60 * 60 * 24)
  }

  return date
}
