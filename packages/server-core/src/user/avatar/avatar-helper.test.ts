import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

// import { generateAvatarThumbnail } from './generateAvatarThumbnail'
// import fs from 'fs'
// import path from 'path'
// import appRootPath from 'app-root-path'

// const debugThumbnail = false

// causes CI/CD weirdness
describe('avatar-helper', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })
})
