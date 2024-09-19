
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  authenticationSettingDataSchema,
  authenticationSettingPatchSchema,
  authenticationSettingQuerySchema,
  authenticationSettingSchema
} from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    authenticationSettingDataSchema,
    authenticationSettingPatchSchema,
    authenticationSettingQuerySchema,
    authenticationSettingSchema
  },
  docs: {
    description: 'Authentication setting service description',
    securities: ['all']
  }
})
