export const filterObject = <T>(
  o: Record<string, T>,
  predicate: (value: T, key: string, obj: Record<string, T>) => boolean,
): Record<string, T> => {
  let filtered = {} as Record<string, T>
  for (const [key, value] of Object.entries(o)) {
    if (predicate(value, key, o)) {
      filtered[key] = value
    }
  }
  return filtered
}
