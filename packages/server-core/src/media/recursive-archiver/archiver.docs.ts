
import { createSwaggerServiceOptions } from 'feathers-swagger'

import { archiverQuerySchema } from '@xrengine/common/src/schemas/media/archiver.schema'

export default createSwaggerServiceOptions({
  schemas: { archiverQuerySchema },
  docs: {
    description: 'Archiver service description',
    securities: ['all']
  }
})
