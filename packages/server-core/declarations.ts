// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext } from '@feathersjs/feathers'
import type { Application as KoaFeathers } from '@feathersjs/koa'
import { ServiceSwaggerOptions } from 'feathers-swagger'
import Primus from 'primus'

import '@feathersjs/transport-commons'

import { ServiceTypes } from '@xrengine/common/declarations'
import { UserType } from '@xrengine/common/src/schemas/user/user.schema'

export type PrimusType = Primus & {
  forEach(cb: (spark: Primus.Spark, id: string, connections: { [id: string]: Primus.Spark }) => boolean | void): Primus
  use(name: string, fn: (req: any, res: any, next: any) => void, level?: number): Primus
}

export type Application = KoaFeathers<ServiceTypes> & {
  sync: any
  primus: PrimusType
  isSetup: Promise<boolean>
}

/**
 * Ref: https://feathersjs-ecosystem.github.io/feathers-swagger/#/?id=configure-the-documentation-for-a-feathers-service
 */
declare module '@feathersjs/feathers' {
  interface ServiceOptions {
    docs?: ServiceSwaggerOptions
  }
  interface Params {
    user?: UserType
    isInternal?: boolean
    forwarded?: {
      ip: string
      port?: number
      secure?: boolean
    }
  }
}

/**
 * Add the user as an optional property to all params
 */
declare module '@feathersjs/knex' {
  interface KnexAdapterParams {
    user?: UserType
    isInternal?: boolean
    forwarded?: {
      ip: string
      port?: number
      secure?: boolean
    }
  }
}

/**
 * The context for hook functions - can be typed with a service class
 */
export type HookContext<S = any> = FeathersHookContext<Application, S>
