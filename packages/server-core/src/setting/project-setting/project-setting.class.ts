import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'
import {
  ProjectSettingData,
  ProjectSettingPatch,
  ProjectSettingQuery,
  ProjectSettingType
} from '@xrengine/common/src/schemas/setting/project-setting.schema'
import { Application } from '@xrengine/server-core/declarations'

export interface ProjectSettingParams extends KnexAdapterParams<ProjectSettingQuery> {}

export class ProjectSettingService<
  T = ProjectSettingType,
  ServiceParams extends Params = ProjectSettingParams
> extends KnexService<ProjectSettingType, ProjectSettingData, ProjectSettingParams, ProjectSettingPatch> {
  app: Application
}
