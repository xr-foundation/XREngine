// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { BuilderInfoType } from '@xrengine/common/src/schemas/projects/builder-info.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const builderInfoResolver = resolve<BuilderInfoType, HookContext>({})

export const builderInfoExternalResolver = resolve<BuilderInfoType, HookContext>({})
