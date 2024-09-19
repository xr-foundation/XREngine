import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  EmailSettingData,
  EmailSettingPatch,
  EmailSettingQuery,
  EmailSettingType
} from '@xrengine/common/src/schemas/setting/email-setting.schema'

export interface EmailSettingParams extends KnexAdapterParams<EmailSettingQuery> {}

export class EmailSettingService<
  T = EmailSettingType,
  ServiceParams extends Params = EmailSettingParams
> extends KnexService<EmailSettingType, EmailSettingData, EmailSettingParams, EmailSettingPatch> {}
