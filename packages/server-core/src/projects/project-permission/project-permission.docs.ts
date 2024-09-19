
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  projectPermissionDataSchema,
  projectPermissionPatchSchema,
  projectPermissionQuerySchema,
  projectPermissionSchema
} from '@xrengine/common/src/schemas/projects/project-permission.schema'

export default createSwaggerServiceOptions({
  schemas: {
    projectPermissionDataSchema,
    projectPermissionPatchSchema,
    projectPermissionQuerySchema,
    projectPermissionSchema
  },
  docs: {
    description: 'Project permission service description',
    securities: ['all']
  }
})
