import { ClientSettingDatabaseType, clientSettingPath } from '../../common/src/schemas/setting/client-setting.schema'

import knex from 'knex'
import { clientDbToSchema } from '../../server-core/src/setting/client-setting/client-setting.resolvers'

export const getClientSetting = async () => {
  const knexClient = knex({
    client: 'mysql',
    connection: {
      user: process.env.MYSQL_USER ?? 'server',
      password: process.env.MYSQL_PASSWORD ?? 'password',
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE ?? 'xrengine',
      charset: 'utf8mb4'
    }
  })

  const clientSetting = await knexClient
    .select()
    .from<ClientSettingDatabaseType>(clientSettingPath)
    .then(([dbClient]) => {
      const dbClientConfig = clientDbToSchema(dbClient) || {
        logo: './logo.svg',
        title: 'XREngine',
        url: 'https://local.xrfoundation.org',
        releaseName: 'local',
        siteDescription: 'Connected Worlds for Everyone',
        favicon32px: '/favicon-32x32.png',
        favicon16px: '/favicon-16x16.png',
        icon192px: '/android-chrome-192x192.png',
        icon512px: '/android-chrome-512x512.png'
      }
      if (dbClientConfig) {
        return dbClientConfig
      }
    })
    .catch((e) => {
      console.warn('[vite.config]: Failed to read clientSetting')
      console.warn(e)
    })

  await knexClient.destroy()

  return clientSetting!
}
