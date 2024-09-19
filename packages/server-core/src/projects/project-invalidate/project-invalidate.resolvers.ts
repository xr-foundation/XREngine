
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectInvalidatePatch } from '@xrengine/common/src/schemas/projects/project-invalidate.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const projectInvalidatePatchResolver = resolve<ProjectInvalidatePatch, HookContext>({})
