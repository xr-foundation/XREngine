import { Params, ServiceInterface } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import appconfig from '../../appconfig'

/**
 * A class for Login service
 */
export class JWTPublicKeyService implements ServiceInterface {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * A function which find specific login details
   *
   * @param params
   * @returns {token}
   */
  async find(params?: Params) {
    return appconfig.authentication.jwtPublicKey
  }
}
