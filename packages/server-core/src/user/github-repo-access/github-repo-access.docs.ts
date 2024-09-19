
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  githubRepoAccessDataSchema,
  githubRepoAccessPatchSchema,
  githubRepoAccessQuerySchema,
  githubRepoAccessSchema
} from '@xrengine/common/src/schemas/user/github-repo-access.schema'

export default createSwaggerServiceOptions({
  schemas: {
    githubRepoAccessDataSchema,
    githubRepoAccessPatchSchema,
    githubRepoAccessQuerySchema,
    githubRepoAccessSchema
  },
  docs: {
    description: 'Github repo access service description',
    securities: ['all']
  }
})
