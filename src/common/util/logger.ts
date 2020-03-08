import {
  createDecorator,
  AnyFunction,
  decorateObject,
} from './object/decorator'
import { isDebugging } from './env'

export const log = (name: string) => {
  return (...args) => {
    if (isDebugging) {
      console.log(`[${name}]`, ...args)
    }
  }
}

/**
 * 装饰后的 fn 会记录调用参数和返回结果
 */
export const logFunction = <T extends AnyFunction>(name: string, fn: T): T => {
  const logger = log(name)
  return createDecorator<T>({
    onCalled(params: any): void {
      // @ts-ignore
      logger(...params)
    },
    onReturned(result: T): void {
      logger(result)
    },
    onError(error: any): void {
      logger(` <ERROR> `)
      console.error(error)
      if (isDebugging) {
        debugger
      }
    },
  })(fn)
}

/**
 * 记录对象各个方法的调用情况
 * 并添加到 window.logged.*上
 */
export const logObject = <T = any>(
  object: T,
  namespace: string,
  stopAtError = false,
): T => {
  const loggers = {} as any
  const getLogger = (fnName: string) => {
    if (!loggers[fnName]) {
      loggers[fnName] = log(`${namespace}:${fnName}`)
    }
    return loggers[fnName]
  }
  const loggedObject = decorateObject<T>(object, {
    onCalled(params: any, fnName: string): void {
      getLogger(fnName)(...params)
    },
    onReturned(result: any, _params: any, fnName: string): void {
      getLogger(fnName)(result)
    },
    onError(error: any, _params: any, fnName: string): void {
      getLogger(fnName)(` <ERROR> `)
      console.error(error)
      if (stopAtError) {
        debugger
      }
    },
  })

  // @ts-ignore
  if (typeof window !== 'undefined') {
    // @ts-ignore
    const w = window as any
    if (!w.logged) {
      w.logged = {}
    }
    w.logged[namespace] = object
  }

  return loggedObject
}
