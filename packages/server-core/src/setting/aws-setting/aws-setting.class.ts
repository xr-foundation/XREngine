import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  AwsSettingData,
  AwsSettingPatch,
  AwsSettingQuery,
  AwsSettingType
} from '@xrengine/common/src/schemas/setting/aws-setting.schema'

export interface AwsSettingParams extends KnexAdapterParams<AwsSettingQuery> {}

export class AwsSettingService<T = AwsSettingType, ServiceParams extends Params = AwsSettingParams> extends KnexService<
  AwsSettingType,
  AwsSettingData,
  AwsSettingParams,
  AwsSettingPatch
> {}
