import { createSwaggerServiceOptions } from 'feathers-swagger'

import { oembedSchema } from '@xrengine/common/src/schemas/media/oembed.schema'

export default createSwaggerServiceOptions({
  schemas: {
    oembedSchema
  },
  docs: {
    description: 'Oembed service description',
    securities: ['all']
  }
})
