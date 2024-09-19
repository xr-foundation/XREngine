import { KnexSeed } from '@xrengine/common/src/interfaces/KnexSeed'

import * as authenticationSeed from './authentication-setting/authentication-setting.seed'
import * as awsSeed from './aws-setting/aws-setting.seed'
import * as chargebeeSeed from './chargebee-setting/chargebee-setting.seed'
import * as clientSeed from './client-setting/client-setting.seed'
import * as coilSeed from './coil-setting/coil-setting.seed'
import * as emailSeed from './email-setting/email-setting.seed'
import * as engineSeed from './engine-setting/engine-setting.seed'
import * as helmSeed from './helm-setting/helm-setting.seed'
import * as instanceServerSeed from './instance-server-setting/instance-server-setting.seed'
import * as mailchimpSeed from './mailchimp-setting/mailchimp-setting.seed'
import * as redisSeed from './redis-setting/redis-setting.seed'
import * as serverSeed from './server-setting/server-setting.seed'
import * as zendeskSeed from './zendesk-setting/zendesk-setting.seed'

export const settingSeeds: Array<KnexSeed> = [
  authenticationSeed,
  clientSeed,
  serverSeed,
  chargebeeSeed,
  instanceServerSeed,
  coilSeed,
  emailSeed,
  redisSeed,
  awsSeed,
  helmSeed,
  zendeskSeed,
  mailchimpSeed,
  engineSeed
]
