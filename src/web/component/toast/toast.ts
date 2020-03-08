import m from 'mithril'
import { WiredCard } from 'wired-elements'
import { keepTruthy } from '../../../common/util/array/filter'
import { debounce } from '../../../common/util/async/debounce'
import { use } from '../../util/use'
import './toast.scss'
use(WiredCard)

let message: string = ''
let isShown = false
let type: 'error' | undefined
const Toast: m.FactoryComponent = () => {
  return {
    view() {
      return m(
        '.toast',
        {
          class: keepTruthy([isShown ? 'is-active' : '', type]).join(' '),
        },
        [
          m(
            'wired-card.toast-content.f-center',
            {
              fill: type === 'error' ? '#f74a4a' : '#60d3ff',
            },
            message,
          ),
        ],
      )
    },
  }
}

const container = document.body.appendChild(document.createElement('div'))
container.id = 'toast-container'
m.mount(container, Toast)

export const showToast = (msg: string, opt?: { type?: 'error' }) => {
  type = opt?.type
  message = msg
  isShown = true
  m.redraw()
  debouncedHide()
}

export const hideToast = () => {
  isShown = false
  m.redraw()
}

const debouncedHide = debounce(hideToast, { delay: 3000 })
