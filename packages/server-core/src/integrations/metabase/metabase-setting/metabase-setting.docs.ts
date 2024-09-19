
import {
  metabaseSettingDataSchema,
  metabaseSettingPatchSchema,
  metabaseSettingQuerySchema,
  metabaseSettingSchema
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {
    metabaseSettingDataSchema,
    metabaseSettingPatchSchema,
    metabaseSettingQuerySchema,
    metabaseSettingSchema
  },
  docs: {
    description: 'Metabase setting service description',
    securities: ['all']
  }
})
