
import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  MailchimpSettingData,
  MailchimpSettingPatch,
  MailchimpSettingQuery,
  MailchimpSettingType
} from '@xrengine/common/src/schemas/setting/mailchimp-setting.schema'

export interface MailchimpSettingParams extends KnexAdapterParams<MailchimpSettingQuery> {}

export class MailchimpSettingService<
  T = MailchimpSettingType,
  ServiceParams extends Params = MailchimpSettingParams
> extends KnexService<MailchimpSettingType, MailchimpSettingData, MailchimpSettingParams, MailchimpSettingPatch> {}
