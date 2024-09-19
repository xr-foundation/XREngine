// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import { ProjectCheckSourceDestinationMatchType } from '@xrengine/common/src/schemas/projects/project-check-source-destination-match.schema'
import type { HookContext } from '@xrengine/server-core/declarations'

export const projectCheckSourceDestinationMatchResolver = resolve<ProjectCheckSourceDestinationMatchType, HookContext>(
  {}
)

export const projectCheckSourceDestinationMatchExternalResolver = resolve<
  ProjectCheckSourceDestinationMatchType,
  HookContext
>({})
