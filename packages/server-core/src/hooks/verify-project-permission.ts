
import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import {
  projectPermissionPath,
  ProjectPermissionType
} from '@xrengine/common/src/schemas/projects/project-permission.schema'
import { projectPath } from '@xrengine/common/src/schemas/projects/project.schema'
import { UserType } from '@xrengine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default (types: string[]) => {
  return async (context: HookContext<Application>) => {
    if (context.params.isInternal) return context

    const loggedInUser = context.params.user as UserType

    if (!loggedInUser) throw new NotAuthenticated('No logged in user')

    let projectId = ''
    if (context.params.query?.projectId) {
      projectId = context.params.query.projectId
    } else if (context.data?.projectId) {
      projectId = context.data.projectId
    } else if (context.id && context.path === projectPath) {
      projectId = context.id.toString()
    } else {
      throw new BadRequest('Missing project ID in request')
    }

    const project = await context.app.service(projectPath).get(projectId)

    if (!project) throw new NotFound('Project not found')

    if (project.visibility === 'public') {
      return context
    }

    const { data } = (await context.app.service(projectPermissionPath).find({
      query: {
        userId: loggedInUser.id,
        projectId: projectId,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>

    if (data.length === 0) {
      console.error(`Project permission not found. ProjectId: ${projectId}`)
      throw new Forbidden(`Project permission not found`)
    }
    if (!types.includes(data[0].type)) {
      throw new Forbidden('Missing required project permission')
    }

    return context
  }
}
