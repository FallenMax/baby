export const isDebugging =
  /dev/.test(process.env.NODE_ENV || '') ||
  /debug=1/.test(location.search) ||
  /localhost/.test(location.origin)

export const isMobile = window.innerWidth < 450

// @ts-ignore
export const isInWebAppiOS = window.navigator.standalone == true

// @ts-ignore
export const isInWebAppChrome = window.matchMedia('(display-mode: standalone)')
  .matches

export const isWebApp = isInWebAppiOS || isInWebAppChrome
