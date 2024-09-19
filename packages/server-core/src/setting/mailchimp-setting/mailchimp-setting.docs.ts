import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  mailchimpSettingDataSchema,
  mailchimpSettingPatchSchema,
  mailchimpSettingQuerySchema,
  mailchimpSettingSchema
} from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    mailchimpSettingDataSchema,
    mailchimpSettingPatchSchema,
    mailchimpSettingQuerySchema,
    mailchimpSettingSchema
  },
  docs: {
    description: 'Mailchimp setting service description',
    securities: ['all']
  }
})
