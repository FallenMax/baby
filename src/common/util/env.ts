export const isDebugging =
  (typeof process !== 'undefined' && /dev/.test(process.env.NODE_ENV || '')) ||
  (typeof location !== 'undefined' &&
    (/debug=1/.test(location.search) || /localhost/.test(location.origin)))

export const isMac =
  typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

export const isMobile = typeof window !== 'undefined' && window.innerWidth < 450
