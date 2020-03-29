import { map } from './map'

export const encodeField = (o: any) => {
  if (o instanceof Date) {
    return {
      $$date: o.toISOString(),
    }
  } else {
    return o
  }
}

export const decodeField = (o: any) => {
  if (o && typeof o.$$date === 'string') {
    return new Date(o.$$date)
  } else {
    return o
  }
}

export const encode = (o: any) => map(o, encodeField)
export const decode = (o: any) => map(o, decodeField)
