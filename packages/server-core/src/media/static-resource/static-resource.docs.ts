
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  staticResourceDataSchema,
  staticResourcePatchSchema,
  staticResourceQuerySchema,
  staticResourceSchema
} from '@xrengine/common/src/schemas/media/static-resource.schema'

export default createSwaggerServiceOptions({
  schemas: {
    staticResourceDataSchema,
    staticResourcePatchSchema,
    staticResourceQuerySchema,
    staticResourceSchema
  },
  docs: {
    description: 'Static resource service description',
    securities: ['all']
  }
})
