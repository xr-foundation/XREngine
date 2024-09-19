import assert from 'assert'

import { builderInfoPath } from '@xrengine/common/src/schemas/projects/builder-info.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { engineVersion } from '../project/project-helper'

describe('builder-info.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should get the builder info', async () => {
    const builderInfo = await app.service(builderInfoPath).get()
    assert.equal(builderInfo.engineVersion, engineVersion)
  })
})
