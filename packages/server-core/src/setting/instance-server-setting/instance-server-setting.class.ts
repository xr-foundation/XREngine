
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  InstanceServerSettingData,
  InstanceServerSettingPatch,
  InstanceServerSettingQuery,
  InstanceServerSettingType
} from '@xrengine/common/src/schemas/setting/instance-server-setting.schema'

export interface InstanceServerSettingParams extends KnexAdapterParams<InstanceServerSettingQuery> {}

export class InstanceServerSettingService<
  T = InstanceServerSettingType,
  ServiceParams extends Params = InstanceServerSettingParams
> extends KnexService<
  InstanceServerSettingType,
  InstanceServerSettingData,
  InstanceServerSettingParams,
  InstanceServerSettingPatch
> {}
