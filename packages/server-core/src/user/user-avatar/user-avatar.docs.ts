
import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  userAvatarDataSchema,
  userAvatarPatchSchema,
  userAvatarQuerySchema,
  userAvatarSchema
} from '@xrengine/common/src/schemas/user/user-avatar.schema'

export default createSwaggerServiceOptions({
  schemas: {
    userAvatarDataSchema,
    userAvatarPatchSchema,
    userAvatarQuerySchema,
    userAvatarSchema
  },
  docs: {
    description: 'User avatar service description',
    securities: ['all']
  }
})
