export const indexedBy = <T extends string>(key: T) => <
  V extends { [K in T]: string | number }
>(
  arr: V[],
): Record<V[T], V> => {
  let map = {} as Record<V[T], V>
  arr.forEach((item) => {
    map[item[key] as string] = item
  })
  return map
}

export const indexedById = indexedBy('id')
