import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import {
  MetabaseUrlData,
  MetabaseUrlQuery
} from '@xrengine/common/src/schemas/integrations/metabase/metabase-url.schema'
import { BaseService } from '@xrengine/server-core/src/BaseService'

export interface MetabaseUrlParams extends KnexAdapterParams<MetabaseUrlQuery> {}

export class MetabaseUrlService<
  T = MetabaseUrlData,
  ServiceParams extends Params = MetabaseUrlParams
> extends BaseService<string, MetabaseUrlData, MetabaseUrlParams, void> {}
