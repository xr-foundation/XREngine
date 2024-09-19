import internalIp from 'internal-ip'

import configFile from '../appconfig'

export default async () => {
  return configFile.instanceserver.domain === 'localhost'
    ? ((await internalIp.v4()) as string)
    : configFile.instanceserver.domain
}
