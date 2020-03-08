import { ExtendedContext } from './context'
import { ReturnPromise } from '../../common/util.types'
import { ApiSync } from '../../common/types'
import { AddParameter, ParameterToMulterFile } from '../utils/api_map'

export type ApiWithContext = ReturnPromise<
  AddParameter<ParameterToMulterFile<ApiSync>, ExtendedContext>
>
