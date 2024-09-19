import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  emailSettingDataSchema,
  emailSettingPatchSchema,
  emailSettingQuerySchema,
  emailSettingSchema
} from '@xrengine/common/src/schemas/setting/email-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    emailSettingDataSchema,
    emailSettingPatchSchema,
    emailSettingQuerySchema,
    emailSettingSchema
  },
  docs: {
    description: 'Email setting service description',
    securities: ['all']
  }
})
