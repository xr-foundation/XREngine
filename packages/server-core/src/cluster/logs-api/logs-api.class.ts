
import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import config from '@xrengine/common/src/config'

import { Application } from '../../../declarations'
import { logger } from '../../ServerLogger'

export interface LogsApiParams extends KnexAdapterParams {}

/**
 * A class for LogsApi service
 */

export class LogsApiService implements ServiceInterface<void, any, LogsApiParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: any, params?: LogsApiParams) {
    if (config.client.logs.forceClientAggregate === 'true') {
      const userId = params?.user?.id

      if (Array.isArray(data)) {
        for (const item of data) {
          this._processLogItem(item, userId)
        }
      } else {
        this._processLogItem(data, userId)
      }
    }
  }

  _processLogItem = (logItem, userId?: string) => {
    const { msg, level } = logItem

    delete logItem.level
    delete logItem.msg

    logger[level]({ ...logItem, userId }, msg)
  }
}
