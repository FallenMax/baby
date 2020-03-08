import { createDecorator } from '../../common/util/object/decorator'
import { showToast } from '../component/toast/toast'

export const showError = (e) => {
  console.error(e)
  const isNetworkDown = navigator.onLine === false
  const message =
    (e && e.errmsg) ||
    (isNetworkDown
      ? 'Unable to connect to network'
      : 'Unknown error occured, please try again')

  showToast(message, { type: 'error' })

  // window.alert(message)
}

export const showErrorOnFail: <T extends Function>(t: T) => T = createDecorator(
  {
    onError: showError,
  },
) as any
