export const keepTruthy = <T>(arr: T[]): Exclude<T, null | undefined | false | 0 | ''>[] => {
  return arr.filter(Boolean) as any
}
