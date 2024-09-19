
import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  AnalyticsData,
  AnalyticsPatch,
  AnalyticsQuery,
  AnalyticsType
} from '@xrengine/common/src/schemas/analytics/analytics.schema'

export interface AnalyticsParams extends KnexAdapterParams<AnalyticsQuery> {}

export class AnalyticsService<T = AnalyticsType, ServiceParams extends Params = AnalyticsParams> extends KnexService<
  AnalyticsType,
  AnalyticsData,
  AnalyticsParams,
  AnalyticsPatch
> {}
