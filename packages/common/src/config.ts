
import { EMAIL_REGEX } from './regex'
import type { MediaSettingsType } from './schema.type.module'

/**
 * Config settings (for client and isomorphic engine usage).
 */
const localBuildOrDev =
  globalThis.process.env.APP_ENV === 'development' || globalThis.process.env.VITE_LOCAL_BUILD === 'true'

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

/** @deprecated - use import from @xrengine/hyperflux instead */
export const isDev = globalThis.process.env.APP_ENV === 'development'

/**
 * Client / frontend
 */
const client = {
  appEnv: globalThis.process.env.APP_ENV,
  nodeEnv: globalThis.process.env.NODE_ENV,
  localNginx: globalThis.process.env.VITE_LOCAL_NGINX,
  localBuild: globalThis.process.env.VITE_LOCAL_BUILD,
  localBuildOrDev,
  clientUrl:
    localBuildOrDev && globalThis.process.env.VITE_LOCAL_NGINX !== 'true'
      ? `https://${globalThis.process.env.VITE_APP_HOST}:${globalThis.process.env.VITE_APP_PORT}`
      : `https://${globalThis.process.env.VITE_APP_HOST}`,
  serverHost: globalThis.process.env.VITE_SERVER_HOST,
  serverUrl:
    localBuildOrDev && globalThis.process.env.VITE_LOCAL_NGINX !== 'true'
      ? `https://${globalThis.process.env.VITE_SERVER_HOST}:${globalThis.process.env.VITE_SERVER_PORT}`
      : `https://${globalThis.process.env.VITE_SERVER_HOST}`,
  instanceserverUrl:
    localBuildOrDev && globalThis.process.env.VITE_LOCAL_NGINX !== 'true'
      ? `https://${globalThis.process.env.VITE_INSTANCESERVER_HOST}:${globalThis.process.env.VITE_INSTANCESERVER_PORT}`
      : `https://${globalThis.process.env.VITE_INSTANCESERVER_HOST}`,
  fileServer:
    (globalThis.process.env.TEST === 'true'
      ? globalThis.process.env.VITE_TEST_FILE_SERVER
      : globalThis.process.env.VITE_FILE_SERVER) ?? 'https://localhost:8642',
  mediatorServer: globalThis.process.env.VITE_MEDIATOR_SERVER,
  cors: {
    proxyUrl:
      localBuildOrDev && globalThis.process.env.VITE_LOCAL_NGINX !== 'true'
        ? `https://${globalThis.process.env.VITE_SERVER_HOST}:${globalThis.process.env.VITE_CORS_SERVER_PORT}`
        : `https://${globalThis.process.env.VITE_SERVER_HOST}/cors-proxy`,
    serverPort: globalThis.process.env.VITE_CORS_SERVER_PORT
  },
  logs: {
    forceClientAggregate: globalThis.process.env.VITE_FORCE_CLIENT_LOG_AGGREGATE,
    disabled: globalThis.process.env.VITE_DISABLE_LOG
  },
  mediaSettings: null! as MediaSettingsType,
  rootRedirect: globalThis.process.env.VITE_ROOT_REDIRECT,
  tosAddress: globalThis.process.env.VITE_TERMS_OF_SERVICE_ADDRESS,
  readyPlayerMeUrl: globalThis.process.env.VITE_READY_PLAYER_ME_URL,
  avaturnUrl: globalThis.process.env.VITE_AVATURN_URL,
  avaturnAPI: globalThis.process.env.VITE_AVATURN_API,
  key8thWall: globalThis.process.env.VITE_8TH_WALL!,
  featherStoreKey: globalThis.process.env.VITE_FEATHERS_STORE_KEY,
  gaMeasurementId: globalThis.process.env.VITE_GA_MEASUREMENT_ID,

  zendesk: {
    enabled: globalThis.process.env.VITE_ZENDESK_ENABLED,
    authenticationEnabled: globalThis.process.env.VITE_ZENDESK_AUTHENTICATION_ENABLED,
    key: globalThis.process.env.VITE_ZENDESK_KEY
  }
}

/**
 * Full config
 */
export const config = {
  client
}

export default config
