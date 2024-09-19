
import { Paginated } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { projectPath } from '@xrengine/common/src/schemas/projects/project.schema'
import { routePath, RouteType } from '@xrengine/common/src/schemas/route/route.schema'
import { deleteFolderRecursive } from '@xrengine/common/src/utils/fsHelperFunctions'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const params = { isInternal: true } as any

const cleanup = async (app: Application, projectName: string, projectId: string) => {
  const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${projectName.split('/')[0]}/`)
  deleteFolderRecursive(projectDir)
  try {
    await app.service(projectPath).remove(projectId)
  } catch (e) {
    //
  }
}

const updateXREngineConfigForTest = (projectName: string, customRoute: string) => {
  const testXREngineConfig = `
  import type { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

  const config: ProjectConfigInterface = {
    routes: {
      test: {
        component: () => import('@xrengine/client/src/pages/index'),
      },
      "${customRoute}": {
        component: () => import('@xrengine/client/src/pages/index'),
      }
    },
  }
  
  export default config
  `

  const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')
  const projectLocalDirectory = path.resolve(projectsRootFolder, projectName)
  const xrEngineConfigFilePath = path.resolve(projectLocalDirectory, 'xrengine.config.ts')

  if (fs.existsSync(xrEngineConfigFilePath)) fs.rmSync(xrEngineConfigFilePath)
  fs.writeFileSync(xrEngineConfigFilePath, testXREngineConfig)
}

describe('route.test', () => {
  let app: Application
  let testProject: string
  let testRoute: string
  let testProjectId: string

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await cleanup(app, testProject, testProjectId)
    await tearDownAPI()
    destroyEngine()
  })

  it('should find the installed project routes', async () => {
    testProject = `@org1/test-project-${uuidv4()}`
    testRoute = `test-route-${uuidv4()}`

    testProjectId = await (await app.service(projectPath).create({ name: testProject }, params)).id
    updateXREngineConfigForTest(testProject, testRoute)

    const installedRoutes = await app.service('routes-installed').find()
    const route = installedRoutes.find((route) => route.project === testProject)

    assert.ok(route)
    assert.equal(route.project, testProject)
  })

  it('should not be activated by default (the installed project)', async () => {
    const route = (await app.service(routePath).find({ query: { project: testProject } })) as Paginated<RouteType>
    assert.equal(route.total, 0)
  })

  it('should activate a route', async () => {
    const activateResult = await app
      .service('route-activate')
      .create({ project: testProject, route: testRoute, activate: true }, params)
    const fetchResult = (await app.service(routePath).find({ query: { project: testProject } })) as Paginated<RouteType>
    const route = fetchResult.data.find((d) => d.project === testProject)

    assert.ok(activateResult)
    assert.equal(fetchResult.total, 1)

    assert.equal(route?.project, testProject)
    assert.equal(route?.route, testRoute)
  })

  it('should deactivate a route', async () => {
    await app.service('route-activate').create({ project: testProject, route: testRoute, activate: false }, params)

    const route = (await app.service(routePath).find({ query: { project: testProject } })) as Paginated<RouteType>
    assert.equal(route.total, 0)
  })
})
