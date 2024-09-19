
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { MigrationsInfoQuery, MigrationsInfoType } from '@xrengine/common/src/schemas/cluster/migrations-info.schema'

export interface MigrationsInfoParams extends KnexAdapterParams<MigrationsInfoQuery> {}

export class MigrationsInfoService<
  T = MigrationsInfoType,
  ServiceParams extends Params = MigrationsInfoParams
> extends KnexService<MigrationsInfoType, void, MigrationsInfoParams, void> {}
