export const mapObject = <T, V>(
  o: Record<string, T>,
  mapper: (value: T, key: string) => V,
): Record<string, V> => {
  let mapped = {} as Record<string, V>
  for (const [key, value] of Object.entries(o)) {
    mapped[key] = mapper(value, key)
  }
  return mapped
}
