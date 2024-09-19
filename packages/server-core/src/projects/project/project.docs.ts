
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  projectDataSchema,
  projectPatchSchema,
  projectQuerySchema,
  projectSchema
} from '@xrengine/common/src/schemas/projects/project.schema'

export default createSwaggerServiceOptions({
  schemas: { projectDataSchema, projectPatchSchema, projectQuerySchema, projectSchema },
  docs: {
    description: 'Project service description',
    securities: ['all']
  }
})
