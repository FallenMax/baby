import { createDecorator } from '../../common/util/object/decorator'
import { showToast } from '../component/toast/toast'

export const showError = (e) => {
  console.error(e)
  const message = (e && e.errmsg) || 'failed'
  showToast(message, { type: 'error' })
}

export const showErrorOnFail: <T extends Function>(t: T) => T = createDecorator(
  {
    onError: showError,
  },
) as any
