import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  chargebeeSettingDataSchema,
  chargebeeSettingPatchSchema,
  chargebeeSettingQuerySchema,
  chargebeeSettingSchema
} from '@xrengine/common/src/schemas/setting/chargebee-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    chargebeeSettingDataSchema,
    chargebeeSettingPatchSchema,
    chargebeeSettingQuerySchema,
    chargebeeSettingSchema
  },
  docs: {
    description: 'Chargebee setting service description',
    securities: ['all']
  }
})
