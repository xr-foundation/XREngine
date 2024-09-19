import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  MetabaseSettingData,
  MetabaseSettingPatch,
  MetabaseSettingQuery,
  MetabaseSettingType
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'

export interface MetabaseSettingParams extends KnexAdapterParams<MetabaseSettingQuery> {}

export class MetabaseSettingService<
  T = MetabaseSettingType,
  ServiceParams extends Params = MetabaseSettingParams
> extends KnexService<MetabaseSettingType, MetabaseSettingData, MetabaseSettingParams, MetabaseSettingPatch> {}
