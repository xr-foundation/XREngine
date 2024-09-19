// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectBuilderTagsType } from '@xrengine/common/src/schemas/projects/project-builder-tags.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const projectBuilderTagsResolver = resolve<ProjectBuilderTagsType, HookContext>({})

export const projectBuilderTagsExternalResolver = resolve<ProjectBuilderTagsType, HookContext>({})
