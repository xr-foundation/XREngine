import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  apiJobDataSchema,
  apiJobPatchSchema,
  apiJobQuerySchema,
  apiJobSchema
} from '@xrengine/common/src/schemas/cluster/api-job.schema'

export default createSwaggerServiceOptions({
  schemas: {
    apiJobDataSchema,
    apiJobPatchSchema,
    apiJobQuerySchema,
    apiJobSchema
  },
  docs: {
    description: 'Build status service description',
    securities: ['all']
  }
})
