import { HookContext, Paginated } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { scopePath, ScopeType } from '@xrengine/common/src/schemas/scope/scope.schema'
import { AvatarID } from '@xrengine/common/src/schemas/user/avatar.schema'
import { userApiKeyPath, UserApiKeyType } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserName, userPath, UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import checkScope from './check-scope'

const mockUserHookContext = (user: UserType, app: Application) => {
  return {
    app,
    params: {
      user
    }
  } as unknown as HookContext<Application>
}

describe('check-scope', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should return false if user does not have scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    user = await app.service(userPath).get(user.id, { user })

    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<UserApiKeyType>

    user.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user.apiKey

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, false)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if guest has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if user has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<UserApiKeyType>

    user.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user.apiKey

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if admin', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    await app.service(scopePath).create({
      type: 'admin:admin' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<UserApiKeyType>

    user.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user.apiKey

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if isInternal', async () => {
    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(null!, app)
    hookContext.params.isInternal = true

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)
  })
})
