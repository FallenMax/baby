//-------------- Color Utils --------------

const padZero = (str: string) => ('00' + str).slice(-2)

export type Color = {
  r: number
  g: number
  b: number
  a?: number
}

export const parse = (str: string): Color | undefined => {
  if (/^#/i.test(str)) {
    return parseHex(str)
  } else if (/^rgba?/i.test(str)) {
    return parseRgba(str)
  } else {
    return parseHex('#' + str)
  }
}

const parseHex = (colorString: string): Color | undefined => {
  const rest = colorString.replace(/^#/i, '')
  if (!/^\w{6,8}$/.test(rest)) {
    return undefined
  }
  const [r, g, b, a] = [
    rest.slice(0, 2),
    rest.slice(2, 4),
    rest.slice(4, 6),
    rest.slice(6, 8),
  ].map((str) => {
    if (str == null) {
      return str
    }
    if (str === '') {
      return undefined
    }
    return Number.parseInt(str, 16)
  })
  if ([r, g, b].every((c) => typeof c === 'number' && c === c)) {
    return (a == null ? { r, g, b } : { r, g, b, a: a / 256 }) as Color
  } else {
    return undefined
  }
}

const parseRgba = (colorString: string): Color | undefined => {
  if (!/^rgba?/i.test(colorString)) {
    return undefined
  }
  const rest = colorString.replace(/^rgba?/i, '')
  const [r, g, b, a] = rest
    .slice(1, -1)
    .split(/, ?/)
    .map((str) => Number(str))
  return { r, g, b, a }
}

export const toHex = (color: Color | string): string => {
  if (typeof color === 'string') {
    const parsed = parse(color)
    if (!parsed) return ''
    return toHex(parsed)
  }
  const { r, g, b, a } = color
  const rgbStr = [r, g, b]
    .map((str) => padZero(Math.round(Number(str)).toString(16)))
    .join('')
    .toUpperCase()
  const aStr =
    a == null
      ? ''
      : padZero(Math.round(Number(a) * 255).toString(16)).toUpperCase()
  return '#' + rgbStr + aStr
}

export const toRgba = (color: Color | string): string => {
  if (typeof color === 'string') {
    const parsed = parse(color)
    if (!parsed) return ''
    return toRgba(parsed)
  }
  const { r, g, b, a } = color
  return a == null ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`
}
