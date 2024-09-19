import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  coilSettingDataSchema,
  coilSettingPatchSchema,
  coilSettingQuerySchema,
  coilSettingSchema
} from '@xrengine/common/src/schemas/setting/coil-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    coilSettingDataSchema,
    coilSettingPatchSchema,
    coilSettingQuerySchema,
    coilSettingSchema
  },
  docs: {
    description: 'Coil setting service description',
    securities: ['all']
  }
})
