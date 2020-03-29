import { ApiSync } from '../../common/types'
import { AddParameter, MakeAsync } from '../../common/util.types'
import { ExtendedContext } from './context'

export type ApiWithContext = MakeAsync<AddParameter<ApiSync, ExtendedContext>>
