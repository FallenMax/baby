import m from 'mithril'
import { assertNever } from '../../common/util/assert'

type Result =
  | { type: 'init' }
  | { type: 'loading' }
  | { type: 'success'; component: m.ComponentTypes<any> }
  | { type: 'error'; error: any }

type Options = {
  preload: boolean
  preloadAfterMs: number
  placeholder: any
  fallback: any
}

export const lazy = <K extends m.ComponentTypes<any>>(
  fetcher: () => Promise<K>,
  options?: Partial<Options>,
): K => {
  const {
    preload = false,
    preloadAfterMs = 5000,
    placeholder = undefined,
    fallback = undefined,
  } = options || {}

  let status: Result = { type: 'init' }
  let initialized = false

  const fetchComponent = async () => {
    if (status.type !== 'init') {
      return
    }
    try {
      status = { type: 'loading' }
      const component = await fetcher()
      status = { type: 'success', component }
    } catch (error) {
      status = { type: 'error', error }
    }
    if (initialized) {
      m.redraw()
    }
  }

  const LazyLoaded: any = () => {
    return {
      oninit() {
        initialized = true
        fetchComponent()
      },
      view({ attrs, children }) {
        switch (status.type) {
          case 'init':
          case 'loading': {
            return m('', placeholder)
          }
          case 'success': {
            return m(status.component, attrs, children)
          }
          case 'error':
            console.error('[lazy] load error:', status.error)
            return m('', fallback)

          default:
            return assertNever(status)
        }
      },
    }
  }

  if (preload) {
    setTimeout(fetchComponent, preloadAfterMs)
  }
  return LazyLoaded as K
}
