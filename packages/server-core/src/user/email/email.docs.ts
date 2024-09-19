
import { createSwaggerServiceOptions } from 'feathers-swagger'

import { emailDataSchema } from '@xrengine/common/src/schemas/user/email.schema'

export default createSwaggerServiceOptions({
  schemas: { emailDataSchema },
  docs: {
    description: 'Email service description',
    securities: ['all']
  }
})
