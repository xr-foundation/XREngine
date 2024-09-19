
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  AuthenticationSettingData,
  AuthenticationSettingPatch,
  AuthenticationSettingQuery,
  AuthenticationSettingType
} from '@xrengine/common/src/schemas/setting/authentication-setting.schema'

export interface AuthenticationSettingParams extends KnexAdapterParams<AuthenticationSettingQuery> {}

/**
 * A class for AuthenticationSetting service
 */

export class AuthenticationSettingService<
  T = AuthenticationSettingType,
  ServiceParams extends Params = AuthenticationSettingParams
> extends KnexService<
  AuthenticationSettingType,
  AuthenticationSettingData,
  AuthenticationSettingParams,
  AuthenticationSettingPatch
> {}
