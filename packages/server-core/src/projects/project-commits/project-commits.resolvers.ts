// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectCommitsType } from '@xrengine/common/src/schemas/projects/project-commits.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const projectCommitsResolver = resolve<ProjectCommitsType, HookContext>({})

export const projectCommitsExternalResolver = resolve<ProjectCommitsType, HookContext>({})
