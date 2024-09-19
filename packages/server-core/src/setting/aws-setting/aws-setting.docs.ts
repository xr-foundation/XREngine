
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  awsSettingDataSchema,
  awsSettingPatchSchema,
  awsSettingQuerySchema,
  awsSettingSchema
} from '@xrengine/common/src/schemas/setting/aws-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    awsSettingDataSchema,
    awsSettingPatchSchema,
    awsSettingQuerySchema,
    awsSettingSchema
  },
  docs: {
    description: 'Aws setting service description',
    securities: ['all']
  }
})
