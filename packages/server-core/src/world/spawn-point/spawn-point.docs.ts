import { createSwaggerServiceOptions } from 'feathers-swagger'

import { spawnPointSchema } from '@xrengine/common/src/schemas/world/spawn-point.schema'

export default createSwaggerServiceOptions({
  schemas: { spawnPointSchema },
  docs: {
    description: 'Spawn point service description',
    securities: ['all']
  }
})
