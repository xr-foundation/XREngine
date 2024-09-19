import assert from 'assert'
import { v4 as uuidv4 } from 'uuid'

import { ScopeType } from '@xrengine/common/src/schemas/scope/scope.schema'
import { avatarPath, AvatarType } from '@xrengine/common/src/schemas/user/avatar.schema'
import { userApiKeyPath } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath, UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const users: UserType[] = []

describe('user.test', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  let avatar: AvatarType
  before(async () => {
    const avatarName = 'CyberbotGreen'
    avatar = await app.service(avatarPath).create({
      name: avatarName
    })
  })

  it('should create a user with guest role', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    const item = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest,
      scopes: []
    })
    users.push(item)

    assert.equal(item.name, name)
    assert.equal(item.avatarId, avatar.id)
    assert.equal(item.isGuest, isGuest)
    assert.ok(item.id)
  })

  it('should create a user with user role', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    const item = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest,
      scopes: []
    })
    users.push(item)

    assert.equal(item.name, name)
    assert.equal(item.avatarId, avatar.id)
    assert.equal(item.isGuest, isGuest)
    assert.ok(item.id)
  })

  it('should find users', async () => {
    for (const user of users) {
      const item = await app.service(userPath).find({
        query: {
          id: user.id
        },
        isInternal: true
      })

      assert.ok(item, 'user item is found')
    }
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(userPath).find({
      isInternal: true
    })

    assert.ok('total' in item)
  })

  it('should patch users', async () => {
    for (const user of users) {
      const newName = uuidv4() as UserName
      await app.service(userPath).patch(
        user.id,
        {
          name: newName
        },
        {
          isInternal: true
        }
      )
      const { name } = await app.service(userPath).get(user.id)
      assert.equal(newName, name)
    }
  })

  it('should patch a user with a query without affecting users not part of that query', async () => {
    const newName = uuidv4() as UserName
    const user1 = users[0]
    const user2 = users[1]
    await app.service(userPath).patch(user1.id, {
      name: newName
    })
    const updatedUser1 = await app.service(userPath).get(user1.id)
    const updatedUser2 = await app.service(userPath).get(user2.id)
    assert.equal(newName, updatedUser1.name)
    assert.notEqual(newName, updatedUser2.name)
  })

  it('should not be able to patch user scopes without being admin', async () => {
    const userWriteUser = await app.service(userPath).create({
      name: `Test UserWrite #${Math.random()}` as UserName,
      scopes: [{ type: 'user:write' as ScopeType }],
      avatarId: avatar.id
    })
    const userWriteUserApiKey = await app.service(userApiKeyPath).create({ userId: userWriteUser.id })

    const userWithScopes = await app.service(userPath).create({
      name: `Test UserWithScopes #${Math.random()}` as UserName,
      scopes: [{ type: 'editor:write' as ScopeType }],
      avatarId: avatar.id
    })

    const newName = `Test UserWithScopes 2 #${Math.random()}` as UserName

    const patchUserResult = await app.service(userPath).patch(
      userWithScopes.id,
      {
        name: newName,
        scopes: [{ type: 'admin:admin' as ScopeType }]
      },
      {
        provider: 'rest',
        headers: {
          authorization: `Bearer ${userWriteUserApiKey.token}`
        }
      }
    )

    assert.equal(patchUserResult.name, newName)
    assert.deepEqual(patchUserResult.scopes, userWithScopes.scopes)
  })

  it('should not be able to remove admin users without being admin', async () => {
    const adminUser = await app.service(userPath).create({
      name: `Test Admin #${Math.random()}` as UserName,
      scopes: [{ type: 'admin:admin' as ScopeType }],
      avatarId: avatar.id
    })
    const userWriteUser = await app.service(userPath).create({
      name: `Test UserWrite #${Math.random()}` as UserName,
      scopes: [{ type: 'admin:admin' as ScopeType }],
      avatarId: avatar.id
    })

    const userWriteUserApiKey = await app.service(userApiKeyPath).create({ userId: userWriteUser.id })

    assert.rejects(
      async () =>
        await app.service(userPath).remove(adminUser.id, {
          provider: 'rest',
          headers: {
            authorization: `Bearer ${userWriteUserApiKey.token}`
          }
        })
    )

    users.push(adminUser)
    users.push(userWriteUser)
  })

  it('should remove users', async () => {
    for (const user of users) {
      const item = await app.service(userPath).remove(user.id)
      assert.ok(item, 'user item is removed')
    }
  })
})
