import { createSwaggerServiceOptions } from 'feathers-swagger'

import { instanceProvisionSchema } from '@xrengine/common/src/schemas/networking/instance-provision.schema'

export default createSwaggerServiceOptions({
  schemas: {
    instanceProvisionSchema
  },
  docs: {
    description: 'Instance provision service description',
    securities: ['all']
  }
})
