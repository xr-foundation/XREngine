import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  HelmSettingData,
  HelmSettingPatch,
  HelmSettingQuery,
  HelmSettingType
} from '@xrengine/common/src/schemas/setting/helm-setting.schema'

export interface HelmSettingParams extends KnexAdapterParams<HelmSettingQuery> {}

export class HelmSettingService<
  T = HelmSettingType,
  ServiceParams extends Params = HelmSettingParams
> extends KnexService<HelmSettingType, HelmSettingData, HelmSettingParams, HelmSettingPatch> {}
