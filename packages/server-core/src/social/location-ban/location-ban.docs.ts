import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  locationBanDataSchema,
  locationBanPatchSchema,
  locationBanQuerySchema,
  locationBanSchema
} from '@xrengine/common/src/schemas/social/location-ban.schema'

export default createSwaggerServiceOptions({
  schemas: {
    locationBanDataSchema,
    locationBanPatchSchema,
    locationBanQuerySchema,
    locationBanSchema
  },
  docs: {
    description: 'Location ban service description',
    securities: ['all']
  }
})
