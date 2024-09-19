import { createSwaggerServiceOptions } from 'feathers-swagger'

import { botDataSchema, botPatchSchema, botQuerySchema, botSchema } from '@xrengine/common/src/schemas/bot/bot.schema'

export default createSwaggerServiceOptions({
  schemas: {
    botDataSchema,
    botPatchSchema,
    botQuerySchema,
    botSchema
  },
  docs: {
    description: 'Bot service description',
    securities: ['all']
  }
})
