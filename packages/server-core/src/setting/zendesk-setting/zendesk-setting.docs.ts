import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  zendeskSettingDataSchema,
  zendeskSettingPatchSchema,
  zendeskSettingQuerySchema,
  zendeskSettingSchema
} from '@xrengine/common/src/schemas/setting/zendesk-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    zendeskSettingDataSchema,
    zendeskSettingPatchSchema,
    zendeskSettingQuerySchema,
    zendeskSettingSchema
  },
  docs: {
    description: 'Zendesk setting service description',
    securities: ['all']
  }
})
