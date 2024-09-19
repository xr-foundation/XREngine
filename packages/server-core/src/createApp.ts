
// Do not delete json and urlencoded, they are used even if some IDEs show them as unused

import { feathers } from '@feathersjs/feathers'
import { bodyParser, errorHandler, koa, rest } from '@feathersjs/koa'
import * as k8s from '@kubernetes/client-node'
import { EventEmitter } from 'events'
// Do not delete, this is used even if some IDEs show it as unused
import swagger from 'feathers-swagger'
import sync from 'feathers-sync'
import { parse, stringify } from 'flatted'
import compress from 'koa-compress'
import cors from 'koa-cors'
import helmet from 'koa-helmet'
import healthcheck from 'koa-simple-healthcheck'

import { API } from '@xrengine/common'
import commonConfig from '@xrengine/common/src/config'
import { pipeLogs } from '@xrengine/common/src/logger'
import { pipe } from '@xrengine/common/src/utils/pipe'
import { createEngine } from '@xrengine/ecs/src/Engine'
import { createHyperStore, getMutableState } from '@xrengine/hyperflux'

import { DomainConfigState } from '@xrengine/engine/src/assets/state/DomainConfigState'
import { Application } from '../declarations'
import { logger } from './ServerLogger'
import { ServerMode, ServerState, ServerTypeMode } from './ServerState'
import { default as appConfig, default as config } from './appconfig'
import authenticate from './hooks/authenticate'
import { logError } from './hooks/log-error'
import persistHeaders from './hooks/persist-headers'
import { createDefaultStorageProvider, createIPFSStorageProvider } from './media/storageprovider/storageprovider'
import mysql from './mysql'
import services from './services'
import authentication from './user/authentication'
import primus from './util/primus'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('fix-esm').register()

export const configureOpenAPI = () => (app: Application) => {
  app.configure(
    swagger({
      ui: swagger.swaggerUI({
        docsPath: '/openapi'
        // docsJsonPath: '/openapi.json',
        // indexFile: path.join(process.cwd() + '/openapi.html')
      }),
      specs: {
        info: {
          title: 'XREngine API Surface',
          description: 'APIs for the XREngine application',
          version: '1.0.0'
        },
        schemes: ['https'],
        securityDefinitions: {
          bearer: {
            type: 'apiKey',
            in: 'header',
            name: 'authorization'
          }
        },
        security: [{ bearer: [] }]
      }
    })
  )
  return app
}

export const configurePrimus =
  (instanceserver = false) =>
  (app: Application) => {
    const origin = [
      'https://' + appConfig.server.clientHost,
      'capacitor://' + appConfig.server.clientHost,
      'ionic://' + appConfig.server.clientHost
    ]
    if (!instanceserver) origin.push('https://localhost:3001')
    app.configure(
      primus(
        {
          transformer: 'websockets',
          origins: origin,
          methods: ['OPTIONS', 'GET', 'POST'],
          headers: '*',
          credentials: true
        },
        (primus) => {
          primus.use((message, socket, next) => {
            ;(message as any).feathers.socketQuery = message.query
            ;(message as any).socketQuery = message.query
            ;(message as any).feathers.forwarded = message.forwarded
            next()
          })
        }
      )
    )
    return app
  }

export const configureRedis = () => (app: Application) => {
  if (appConfig.redis.enabled) {
    // https://github.com/feathersjs-ecosystem/feathers-sync/issues/140#issuecomment-810144263
    app.configure(
      sync({
        uri: appConfig.redis.password
          ? `redis://:${appConfig.redis.password}@${appConfig.redis.address}:${appConfig.redis.port}`
          : `redis://${appConfig.redis.address}:${appConfig.redis.port}`,
        serialize: stringify,
        deserialize: parse
      })
    )
    app.sync.ready.then(() => {
      logger.info('Feathers-sync started.')
    })
  }
  return app
}

export const configureK8s = () => (app: Application) => {
  if (appConfig.kubernetes.enabled) {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()
    const serverState = getMutableState(ServerState)

    const k8AgonesClient = kc.makeApiClient(k8s.CustomObjectsApi)
    const k8DefaultClient = kc.makeApiClient(k8s.CoreV1Api)
    const k8AppsClient = kc.makeApiClient(k8s.AppsV1Api)
    const k8BatchClient = kc.makeApiClient(k8s.BatchV1Api)

    serverState.merge({
      k8AppsClient,
      k8BatchClient,
      k8DefaultClient,
      k8AgonesClient
    })
  }
  return app
}

export const serverPipe = pipe(configureOpenAPI(), configurePrimus(), configureRedis(), configureK8s()) as (
  app: Application
) => Application

export const serverJobPipe = pipe(configurePrimus(), configureK8s()) as (app: Application) => Application

export const serverJobRedisPipe = pipe(configurePrimus(), configureRedis(), configureK8s()) as (
  app: Application
) => Application

export const createFeathersKoaApp = (
  serverMode: ServerTypeMode = ServerMode.API,
  configurationPipe = serverPipe
): Application => {
  createEngine(createHyperStore())

  getMutableState(DomainConfigState).merge({
    publicDomain: config.client.dist,
    cloudDomain: commonConfig.client.fileServer,
    proxyDomain: commonConfig.client.cors.proxyUrl
  })

  const serverState = getMutableState(ServerState)
  serverState.serverMode.set(serverMode)

  createDefaultStorageProvider()

  if (appConfig.ipfs.enabled) {
    createIPFSStorageProvider()
  }

  const app = koa(feathers()) as Application
  API.instance = app

  app.set('nextReadyEmitter', new EventEmitter())

  // Feathers authentication-oauth will only append the port in production, but then it will also
  // hard-code http as the protocol, so manually mashing host + port together if in local.
  app.set(
    'host',
    appConfig.server.local ? appConfig.server.hostname + ':' + appConfig.server.port : appConfig.server.hostname
  )
  app.set('port', appConfig.server.port)

  app.set('paginate', appConfig.server.paginate)
  app.set('authentication', appConfig.authentication)
  app.use(healthcheck())
  app.use(
    cors({
      origin: '*',
      credentials: true
    })
  )
  configurationPipe(app)
  // Feathers authentication-oauth will use http for its redirect_uri if this is 'dev'.
  // Doesn't appear anything else uses it.
  app.set('env', 'production')
  app.configure(mysql)

  // Enable security, CORS, compression, favicon and body parsing
  app.use(errorHandler()) // in koa no option to pass logger object its a async function instead and must be set first
  app.use(helmet())

  app.use(compress())
  app.use(
    bodyParser({
      includeUnparsed: true
    })
  )

  app.proxy = true
  app.use(async (ctx, next) => {
    const clientIp = ctx.request.ip

    ctx.feathers = {
      ...ctx.feathers,
      forwarded: {
        ip: clientIp
      }
    }

    await next()
  })

  app.configure(rest())
  // app.use(function (req, res, next) {
  //   ;(req as any).feathers.req = req
  //   ;(req as any).feathers.res = res
  //   next()
  // })

  // Configure other middleware (see `middleware/index.js`)
  app.configure(authentication)

  // Set up our services (see `services/index.js`)
  app.configure(services)

  // Store headers across internal service calls
  app.hooks({
    around: {
      all: [logError, persistHeaders, authenticate]
    }
  })

  pipeLogs(API.instance)

  return app
}

export const tearDownAPI = async () => {
  if (API.instance) {
    if ((API.instance as any).server) await API.instance.teardown()

    const knex = (API.instance as any).get?.('knexClient')
    if (knex) await knex.destroy()
  }
}
