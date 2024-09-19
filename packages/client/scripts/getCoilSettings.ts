
import knex from 'knex'

import { coilSettingPath, CoilSettingType } from '../../common/src/schemas/setting/coil-setting.schema'

export const getCoilSetting = async () => {
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

  const coilSetting = await knexClient
    .select()
    .from<CoilSettingType>(coilSettingPath)
    .then(([dbCoil]) => {
      if (dbCoil) {
        return dbCoil
      }
    })
    .catch((e) => {
      console.warn('[vite.config]: Failed to read coilSetting')
      console.warn(e)
    })

  await knexClient.destroy()

  return coilSetting!
}
