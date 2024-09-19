
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  engineSettingDataSchema,
  engineSettingPatchSchema,
  engineSettingQuerySchema,
  engineSettingSchema
} from '@xrengine/common/src/schemas/setting/engine-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    engineSettingDataSchema,
    engineSettingPatchSchema,
    engineSettingQuerySchema,
    engineSettingSchema
  },
  docs: {
    description: 'Engine setting service description',
    securities: ['all']
  }
})
