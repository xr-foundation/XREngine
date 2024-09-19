
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  clientSettingDataSchema,
  clientSettingPatchSchema,
  clientSettingQuerySchema,
  clientSettingSchema
} from '@xrengine/common/src/schemas/setting/client-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    clientSettingDataSchema,
    clientSettingPatchSchema,
    clientSettingQuerySchema,
    clientSettingSchema
  },
  docs: {
    description: 'Client setting service description',
    securities: ['all']
  }
})
