import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  LocationBanData,
  LocationBanPatch,
  LocationBanQuery,
  LocationBanType
} from '@xrengine/common/src/schemas/social/location-ban.schema'

export interface LocationBanParams extends KnexAdapterParams<LocationBanQuery> {}

export class LocationBanService<
  T = LocationBanType,
  ServiceParams extends Params = LocationBanParams
> extends KnexService<LocationBanType, LocationBanData, LocationBanParams, LocationBanPatch> {}
