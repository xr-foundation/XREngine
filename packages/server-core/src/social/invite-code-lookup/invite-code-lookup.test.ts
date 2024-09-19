import assert from 'assert'

import { inviteCodeLookupPath } from '@xrengine/common/src/schemas/social/invite-code-lookup.schema'
import { avatarPath } from '@xrengine/common/src/schemas/user/avatar.schema'
import { UserName, userPath, UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

let user: UserType

describe('invite-code-lookup service', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const name = `Test #${Math.random()}` as UserName
    const avatarName = 'CyberbotGreen'
    const isGuest = true

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    user = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest,
      scopes: []
    })
  })
  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('registered the service', async () => {
    const service = await app.service(inviteCodeLookupPath)
    assert.ok(service, 'Registered the service')
  })

  it('should find user', async () => {
    const inviteCodeLookups = await app.service(inviteCodeLookupPath).find({
      query: {
        inviteCode: user.inviteCode!
      },
      isInternal: true
    })

    assert.ok(inviteCodeLookups, 'user item is found')
  })
})
