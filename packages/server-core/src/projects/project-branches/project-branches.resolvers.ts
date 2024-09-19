// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectBranchesType } from '@xrengine/common/src/schemas/projects/project-branches.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const projectBranchesResolver = resolve<ProjectBranchesType, HookContext>({})

export const projectBranchesExternalResolver = resolve<ProjectBranchesType, HookContext>({})
