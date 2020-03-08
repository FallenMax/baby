/** Object.values */
export const values: <T>(o: { [K: string]: T }) => T[] =
  (Object as any).values ||
  ((o) => {
    return Object.keys(o).map((key) => o[key])
  })
