import { generateUuid } from '../../common/util/gen_id'
import { decorateObject } from '../../common/util/object/decorator'
import { mapObject } from '../../common/util/object/map_object'
import { openDatabase } from '../lib/database'

type Operation = {
  id: string
  namespace: string
  operation: string
  params: any
  date: Date
  success: boolean
}

const db = openDatabase<Operation>('operation')

const auditService = {
  log(
    namespace: string,
    operation: string,
    params: any,
    success: boolean,
  ): void {
    db.add({
      id: generateUuid(),
      namespace,
      operation,
      params,
      date: new Date(),
      success,
    })
  },
}

const removeCredential = (paramsList: any[]) => {
  return paramsList.map((params) => {
    if (params && typeof params === 'object') {
      return mapObject(params, (value, key) => {
        if (/(password|secret|key)/gi.test(key)) {
          return '******'
        }
      })
    } else {
      return params
    }
  })
}

export const audit = <T = any>(
  object: T,
  namespace: string,
  option?: {
    include?: (keyof T)[]
    exclude?: (keyof T)[]
  },
): T => {
  const { include, exclude } = option || {}
  const allOperations = Object.keys(object) as (keyof T)[]
  const queryKeywords = ['get', 'is', 'find', 'list', 'query', 'can']
  const isQuery = (op: any) => queryKeywords.some((q) => op.startsWith(q))
  const operationsToAudit = include
    ? include
    : exclude
    ? allOperations.filter((op) => !exclude.includes(op))
    : allOperations.filter((op) => !isQuery(op))

  const loggedObject = decorateObject<T>(object, {
    onCalled(params: any, fnName: string): void {},
    onReturned(result: any, params: any, fnName: string): void {
      if (operationsToAudit.includes(fnName as keyof T)) {
        auditService.log(namespace, fnName, removeCredential(params), true)
      }
    },
    onError(error: any, params: any, fnName: string): void {
      if (operationsToAudit.includes(fnName as keyof T)) {
        auditService.log(namespace, fnName, removeCredential(params), false)
      }
    },
  })

  return loggedObject
}
