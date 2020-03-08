export const parseURL = (url: string): URL | undefined => {
  try {
    return new URL(url)
  } catch (error) {
    return undefined
  }
}
