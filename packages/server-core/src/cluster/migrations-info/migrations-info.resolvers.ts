
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { MigrationsInfoQuery, MigrationsInfoType } from '@xrengine/common/src/schemas/cluster/migrations-info.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const migrationsInfoResolver = resolve<MigrationsInfoType, HookContext>({})

export const migrationsInfoExternalResolver = resolve<MigrationsInfoType, HookContext>({})

export const migrationsInfoQueryResolver = resolve<MigrationsInfoQuery, HookContext>({})
