const hasOwn = (o: any, key: string) =>
  Object.prototype.hasOwnProperty.call(o, key)

const getType = (o) =>
  Object.prototype.toString.call(o).slice(8, -1).toLowerCase()

export const map = (o, mapper: Function) => {
  let type = getType(o)
  if (type === 'object') {
    let mapped = {}
    for (const key in o) {
      if (hasOwn(o, key)) {
        mapped[key] = map(o[key], mapper)
      }
    }
    return mapper(mapped)
  }
  if (type === 'array') {
    return mapper(o.map((item) => map(item, mapper)))
  }
  return mapper(o)
}
