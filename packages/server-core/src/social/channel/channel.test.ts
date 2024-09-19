
import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'

import { instancePath, InstanceType } from '@xrengine/common/src/schemas/networking/instance.schema'
import { channelUserPath, ChannelUserType } from '@xrengine/common/src/schemas/social/channel-user.schema'
import { channelPath, ChannelType } from '@xrengine/common/src/schemas/social/channel.schema'
import { RoomCode } from '@xrengine/common/src/schemas/social/location.schema'
import { AvatarID } from '@xrengine/common/src/schemas/user/avatar.schema'
import { InviteCode, UserName, userPath } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('channel service', () => {
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
    const service = app.service(channelPath)
    assert.ok(service, 'Registered the service')
  })

  it('creates a channel without userId or instanceId', async () => {
    const channel = await app.service(channelPath).create({})
    assert.ok(channel.id)
  })

  it('creates and finds channel with userId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const channel = await app.service(channelPath).create({}, { user })

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service(channelPath).find({
      query: {
        id: channel.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelUserByID = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      }
    })) as Paginated<ChannelUserType>

    assert.ok('total' in channelUserByID, 'find result should contain "total"')
    assert.equal(channelUserByID.data.length, 1)
    assert.equal(channelUserByID.data[0].channelId, channel.id)
    assert.equal(channelUserByID.data[0].userId, user.id)

    const channelUserByUser = (await app.service(channelUserPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserByUser.data.length, 1)
    assert.equal(channelUserByUser.data[0].channelId, channel.id)
    assert.equal(channelUserByUser.data[0].userId, user.id)
  })

  it('can remove and finds channel with instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const instance = (await app.service(instancePath).create(
      { roomCode: '' as RoomCode, currentUsers: 0 },
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

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service(channelPath).find({
      query: {
        id: channel.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelFindAsUser = (await app.service(channelPath).find({
      query: {
        instanceId: instance.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsUser.length, 1)
    assert.equal(channelFindAsUser[0].id, channel.id)
  })

  it('will not create a channel with both userId and instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const instance = (await app.service(instancePath).create(
      { roomCode: '' as RoomCode, currentUsers: 0 },
      {
        // @ts-ignore
        isInternal: true
      }
    )) as InstanceType

    try {
      await app.service(channelPath).create(
        {
          instanceId: instance.id
        },
        { user }
      )
    } catch (e) {
      assert.ok(e)
    }
  })

  it('creates and finds channel with instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const instance = (await app.service(instancePath).create(
      { roomCode: '' as RoomCode, currentUsers: 0 },
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

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service(channelPath).find({
      query: {
        id: channel.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelFindAsUser = (await app.service(channelPath).find({
      query: {
        instanceId: instance.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsUser.length, 1)
    assert.equal(channelFindAsUser[0].id, channel.id)
  })
})
