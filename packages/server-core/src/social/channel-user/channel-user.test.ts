

import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'

import { instancePath, InstanceType } from '@xrengine/common/src/schemas/networking/instance.schema'
import { channelUserPath, ChannelUserType } from '@xrengine/common/src/schemas/social/channel-user.schema'
import { channelPath } from '@xrengine/common/src/schemas/social/channel.schema'
import { RoomCode } from '@xrengine/common/src/schemas/social/location.schema'
import { AvatarID } from '@xrengine/common/src/schemas/user/avatar.schema'
import { InviteCode, UserName, userPath } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('channel-user service', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  afterEach(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('registered the service', () => {
    const service = app.service(channelUserPath)
    assert.ok(service, 'Registered the service')
  })

  it('will remove user from channel if they are the owner', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const channel = await app.service(channelPath).create({}, { user })

    assert.ok(channel.id)

    const channelUser = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUser.data.length, 1)
    assert.equal(channelUser.data[0].channelId, channel.id)
    assert.equal(channelUser.data[0].userId, user.id)
    assert.equal(channelUser.data[0].isOwner, true)

    await app.service(channelUserPath).remove(null, {
      query: {
        channelId: channel.id,
        userId: user.id
      },
      user
    })

    const channelUserAfterRemove = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserAfterRemove.data.length, 0)
  })

  it('will not remove user if they are not the owner', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const user2 = await app.service(userPath).create({
      name: 'user2' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const instance = (await app.service(instancePath).create(
      {
        roomCode: '' as RoomCode,
        currentUsers: 0
      },
      {
        // @ts-ignore
        isInternal: true
      }
    )) as InstanceType

    const channel = await app.service(channelPath).create(
      {
        instanceId: instance.id
      },
      { user }
    )

    const channelUser2 = await app.service(channelUserPath).create(
      {
        channelId: channel.id,
        userId: user2.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelUser = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id,
        $sort: { isOwner: -1 }
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUser.data.length, 2)
    assert.equal(channelUser.data[0].channelId, channel.id)
    assert.equal(channelUser.data[0].userId, user.id)
    assert.equal(channelUser.data[0].isOwner, true)
    assert.equal(channelUser.data[1].id, channelUser2.id)
    assert.equal(channelUser.data[1].channelId, channel.id)
    assert.equal(channelUser.data[1].userId, user2.id)
    assert.equal(channelUser.data[1].isOwner, false)

    assert.rejects(() =>
      app.service(channelUserPath).remove(null, {
        query: {
          channelId: channel.id,
          userId: user.id
        },
        user: user2
      })
    )

    const channelUserAfterRemove = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserAfterRemove.data.length, 2)
  })

  it('user can not add themselves to a channel', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const channel = await app.service(channelPath).create({})

    assert.ok(channel.id)

    assert.rejects(() =>
      app.service(channelUserPath).create(
        {
          channelId: channel.id,
          userId: user.id
        },
        {
          user,
          provider: 'rest' // force external to avoid authentication internal escape
        }
      )
    )

    const channelUserAfterRemove = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserAfterRemove.data.length, 0)
  })
})
