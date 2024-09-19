import { NotImplemented } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { metabaseSettingPath } from '@xrengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import { metabaseUrlDataValidator } from '@xrengine/common/src/schemas/integrations/metabase/metabase-url.schema'
import { HookContext } from '@xrengine/server-core/declarations'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'
import { disallow, iff } from 'feathers-hooks-common'
import Jwt from 'jsonwebtoken'
import isAction from '../../../hooks/is-action'
import { MetabaseUrlService } from './metabase-url.class'

/**
 * Get iframe URL of Metabase dashboard for crash
 * @param context
 */
export const metabaseCrashDashboard = async (context: HookContext<MetabaseUrlService>) => {
  const metabaseSetting = await context.app.service(metabaseSettingPath).find()

  if (metabaseSetting.data.length === 0) {
    throw new NotImplemented('Please enter metabase settings')
  }

  const METABASE_SITE_URL = metabaseSetting.data[0].siteUrl
  const METABASE_SECRET_KEY = metabaseSetting.data[0].secretKey
  const ENVIRONMENT = metabaseSetting.data[0].environment
  const EXPIRATION = metabaseSetting.data[0].expiration
  const METABASE_CRASH_DASHBOARD_ID = metabaseSetting.data[0].crashDashboardId

  if (!METABASE_CRASH_DASHBOARD_ID) {
    throw new NotImplemented('Please enter crash dashboard id in metabase settings')
  }

  const payload = {
    resource: { dashboard: parseInt(METABASE_CRASH_DASHBOARD_ID) },
    params: {
      environment: [ENVIRONMENT]
    },
    exp: Math.round(Date.now() / 1000) + EXPIRATION * 60
  }

  const token = Jwt.sign(payload, METABASE_SECRET_KEY)
  context.dispatch = METABASE_SITE_URL + '/embed/dashboard/' + token + '#theme=transparent&bordered=false&titled=false'
}

export default {
  around: {
    all: []
  },

  before: {
    all: [],
    get: [disallow('external')],
    find: [disallow('external')],
    create: [
      schemaHooks.validateData(metabaseUrlDataValidator),
      iff(isAction('crash'), verifyScope('admin', 'admin'), metabaseCrashDashboard)
    ],
    patch: [disallow('external')],
    update: [disallow('external')],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
