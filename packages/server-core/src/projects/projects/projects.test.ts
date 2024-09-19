import assert from 'assert'

import { projectsPath } from '@xrengine/common/src/schemas/projects/projects.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('projects.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should find the projects', async () => {
    const foundProjects = await app.service(projectsPath).find()
    assert.notEqual(
      foundProjects.findIndex((project) => project === 'xrengine/default-project'),
      -1
    )
  })
})
