import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { projectPath } from '@xrengine/common/src/schema.type.module'
import { deleteFolderRecursive } from '@xrengine/common/src/utils/fsHelperFunctions'
import appRootPath from 'app-root-path'
import path from 'path'
import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import resolveProjectId from './resolve-project-id'
resolveProjectId

const mockHookContext = (app: Application, query?: Partial<{ project: string }>) => {
  return {
    app,
    params: {
      query
    }
  } as unknown as HookContext<Application>
}

describe('resolve-project-id', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should fail if project name is missing', async () => {
    const resolveProject = resolveProjectId()
    const hookContext = mockHookContext(app)
    assert.rejects(() => resolveProject(hookContext), BadRequest)
  })

  it('should fail if project is not found', async () => {
    const resolveProject = resolveProjectId()
    const hookContext = mockHookContext(app, { project: `Test #${Math.random()}` })
    assert.rejects(() => resolveProject(hookContext), BadRequest)
  })

  it('should find project id by name', async () => {
    const resolveProject = resolveProjectId()
    const project = await app.service(projectPath).create({
      name: `@org/project #${Math.random()}`
    })
    const hookContext = mockHookContext(app, { project: project.name })
    const contextUpdated = await resolveProject(hookContext)
    assert.equal(contextUpdated.params.query?.projectId, project.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })
})
