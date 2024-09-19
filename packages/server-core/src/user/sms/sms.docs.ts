import { createSwaggerServiceOptions } from 'feathers-swagger'

import { smsDataSchema } from '@xrengine/common/src/schemas/user/sms.schema'

export default createSwaggerServiceOptions({
  schemas: { smsDataSchema },
  docs: {
    description: 'Sms service description',
    securities: ['all']
  }
})
