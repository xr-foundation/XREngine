import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  CoilSettingData,
  CoilSettingPatch,
  CoilSettingQuery,
  CoilSettingType
} from '@xrengine/common/src/schemas/setting/coil-setting.schema'

export interface CoilSettingParams extends KnexAdapterParams<CoilSettingQuery> {}

export class CoilSettingService<
  T = CoilSettingType,
  ServiceParams extends Params = CoilSettingParams
> extends KnexService<CoilSettingType, CoilSettingData, CoilSettingParams, CoilSettingPatch> {}
