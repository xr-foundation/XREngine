
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { SpawnPointQuery, SpawnPointType } from '@xrengine/common/src/schema.type.module'
import { fromDateTimeSql, getDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import { EntityUUID } from '@xrengine/ecs'
import type { HookContext } from '@xrengine/server-core/declarations'

export const spawnPointResolver = resolve<SpawnPointType, HookContext>({
  createdAt: virtual(async (spawnPoint) => fromDateTimeSql(spawnPoint.createdAt)),
  updatedAt: virtual(async (spawnPoint) => fromDateTimeSql(spawnPoint.updatedAt))
})

export const spawnPointExternalResolver = resolve<SpawnPointType, HookContext>({})

export const spawnPointDataResolver = resolve<SpawnPointType, HookContext>({
  id: async () => {
    return v4() as EntityUUID
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const spawnPointPatchResolver = resolve<SpawnPointType, HookContext>({
  updatedAt: getDateTimeSql
})

export const spawnPointQueryResolver = resolve<SpawnPointQuery, HookContext>({})
