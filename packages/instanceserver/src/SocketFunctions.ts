
import {
  identityProviderPath,
  instancePath,
  UserID,
  userPath,
  UserType
} from '@xrengine/common/src/schema.type.module'
import { AuthError, AuthTask } from '@xrengine/common/src/world/receiveJoinWorld'
import { getState } from '@xrengine/hyperflux'
import { Application } from '@xrengine/server-core/declarations'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import { InstanceServerState } from './InstanceServerState'
import { authorizeUserToJoinServer, handleConnectingPeer, handleDisconnect } from './NetworkFunctions'
import { getServerNetwork } from './SocketWebRTCServerFunctions'

const logger = multiLogger.child({ component: 'instanceserver:spark' })

const NON_READY_INTERVALS = 10 * 1000 // 10 seconds

export const setupSocketFunctions = async (app: Application, spark: any) => {
  let authTask: AuthTask | undefined

  /**
   * TODO: update this authorization procedure to use https://frontside.com/effection to better handle async flow
   *
   *
   * Authorize user and make sure everything is valid before allowing them to join the world
   **/
  const ready = await new Promise<boolean>((resolve) => {
    let counter = 0
    const interval = setInterval(() => {
      counter += 100
      if (getState(InstanceServerState).ready) {
        clearInterval(interval)
        resolve(true)
      }
      if (counter >= NON_READY_INTERVALS) {
        clearInterval(interval)
        resolve(false)
      }
    }, 100)
  })

  if (!ready) {
    /** We are not ready, so we can't accept any new connections. The client will try again. */
    app.primus.write({ instanceReady: false })
    return
  }

  app.primus.write({ instanceReady: true })
  const network = getServerNetwork(app)

  const onAuthenticationRequest = async (data) => {
    const peerID = data.peerID

    if (authTask) return

    // start a new auth task and let the client know it's pending.
    // the client will have to keep polling us for the status of the task
    // until it is resolved
    authTask = { status: 'pending' }
    spark.write(authTask)
    logger.info('[MessageTypes.Authorization]: starting authorization for peer %s', peerID)

    /**
     * userId or access token were undefined, so something is wrong. Return failure
     */
    const accessToken = data.accessToken
    if (!accessToken) {
      authTask.status = 'fail'
      authTask.error = AuthError.MISSING_ACCESS_TOKEN
      logger.error('[MessageTypes.Authorization]: peer is missing access token %s %o', peerID, authTask)
      return
    }

    let userId: UserID
    let user: UserType

    try {
      const authResult = await app.service('authentication').strategies.jwt.authenticate!(
        { accessToken: accessToken },
        {}
      )
      userId = authResult[identityProviderPath].userId as UserID
      user = await app.service(userPath).get(userId, { headers: spark.headers })

      if (!user) {
        authTask.status = 'fail'
        authTask.error = AuthError.USER_NOT_FOUND
        logger.error('[MessageTypes.Authorization]: user %s not found over peer %s %o', userId, peerID, authTask)
        return
      }

      // Check that this use is allowed on this instance
      const instance = await app.service(instancePath).get(getState(InstanceServerState).instance.id)
      if (!(await authorizeUserToJoinServer(app, instance, user))) {
        authTask.status = 'fail'
        authTask.error = AuthError.USER_NOT_AUTHORIZED
        logger.error('[MessageTypes.Authorization]: user %s not authorized over peer %s %o', userId, peerID, authTask)
        return
      }

      /**
       * @todo Check that they are supposed to be in this instance
       * @todo Check that token is valid (to prevent users hacking with a manipulated user ID payload)
       * @todo Check if the user is banned
       */

      const connectionData = handleConnectingPeer(network, spark, peerID, user, data.inviteCode)

      spark.write({
        ...connectionData,
        status: 'success'
      })

      spark.off('data', onAuthenticationRequest)

      spark.on('end', () => {
        console.log('got disconnection')
        handleDisconnect(network, peerID)
      })
    } catch (e) {
      console.error(e)
      authTask.status = 'fail'
      authTask.error = AuthError.INTERNAL_ERROR
      logger.error('[MessageTypes.Authorization]: internal error while authorizing peer %s', peerID, e.message)
      return
    }

    logger.info('[MessageTypes.Authorization]: user %s successfully authorized for peer %s', userId, peerID)
    authTask.status = 'success'
  }

  spark.on('data', onAuthenticationRequest)
}
