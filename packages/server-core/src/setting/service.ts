import Authentication from './authentication-setting/authentication-setting'
import Aws from './aws-setting/aws-setting'
import Chargebee from './chargebee-setting/chargebee-setting'
import ClientSetting from './client-setting/client-setting'
import Coil from './coil-setting/coil-setting'
import Email from './email-setting/email-setting'
import EngineSetting from './engine-setting/engine-setting'
import FeatureFlagSetting from './feature-flag-setting/feature-flag-setting'
import Helm from './helm-setting/helm-setting'
import InstanceServer from './instance-server-setting/instance-server-setting'
import MailchimpSetting from './mailchimp-setting/mailchimp-setting'
import ProjectSetting from './project-setting/project-setting'
import RedisSetting from './redis-setting/redis-setting'
import ServerSetting from './server-setting/server-setting'
import ZendeskSetting from './zendesk-setting/zendesk-setting'

export default [
  ProjectSetting,
  EngineSetting,
  ServerSetting,
  ClientSetting,
  InstanceServer,
  Email,
  FeatureFlagSetting,
  Authentication,
  Aws,
  Chargebee,
  Coil,
  RedisSetting,
  Helm,
  ZendeskSetting,
  MailchimpSetting
]
