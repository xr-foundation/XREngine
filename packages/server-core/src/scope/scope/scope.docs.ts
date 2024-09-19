
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  scopeDataSchema,
  scopePatchSchema,
  scopeQuerySchema,
  scopeSchema
} from '@xrengine/common/src/schemas/scope/scope.schema'

export default createSwaggerServiceOptions({
  schemas: {
    scopeDataSchema,
    scopePatchSchema,
    scopeQuerySchema,
    scopeSchema
  },
  docs: {
    description: 'Scope service description',
    securities: ['all']
  }
})
