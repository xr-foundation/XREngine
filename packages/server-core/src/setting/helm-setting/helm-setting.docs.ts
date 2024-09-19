
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  helmSettingDataSchema,
  helmSettingPatchSchema,
  helmSettingQuerySchema,
  helmSettingSchema
} from '@xrengine/common/src/schemas/setting/helm-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    helmSettingDataSchema,
    helmSettingPatchSchema,
    helmSettingQuerySchema,
    helmSettingSchema
  },
  docs: {
    description: 'Helm setting service description',
    securities: ['all']
  }
})
