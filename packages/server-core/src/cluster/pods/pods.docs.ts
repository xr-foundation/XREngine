
import { createSwaggerServiceOptions } from 'feathers-swagger'

import { podsSchema } from '@xrengine/common/src/schemas/cluster/pods.schema'

export default createSwaggerServiceOptions({
  schemas: { podsSchema },
  docs: {
    description: 'Pods service description',
    securities: ['all']
  }
})
