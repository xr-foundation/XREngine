
import assert from 'assert'

import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { createFeathersKoaApp, tearDownAPI } from './createApp'

describe('Core', () => {
  it('should initialise app', async () => {
    const app = createFeathersKoaApp()
    await app.setup()
    assert.ok(app.isSetup)
  })
  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })
})
